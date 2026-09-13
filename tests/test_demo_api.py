import unittest
from datetime import date, timedelta
from uuid import uuid4

from fastapi.testclient import TestClient

from api.main import app


class DemoApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.session_id = self.client.post("/v1/demo/session").json()["session_id"]

    def onboard(self, **updates):
        payload = {
            "session_id": self.session_id,
            "name": "Kajal",
            "journey": "pregnant",
            "timeline_mode": "week",
            "timeline_value": "26",
            "diets": ["Vegetarian"],
            "allergies": ["Peanut"],
            "symptoms": [],
            "use_fictional_sample_record": True,
        }
        payload.update(updates)
        return self.client.post("/v1/demo/onboarding", json=payload)

    def test_onboarding_drives_home(self):
        response = self.onboard()
        self.assertEqual(response.status_code, 200)
        home = self.client.get(f"/v1/demo/home/{self.session_id}").json()
        self.assertEqual(home["journey"]["exact"], 26)
        self.assertEqual(home["confirmed_context"]["allergies"], ["Peanut"])
        self.assertEqual(home["kpis"]["care_records"], 1)

    def test_invalid_week_is_rejected(self):
        response = self.onboard(timeline_value="60")
        self.assertEqual(response.status_code, 422)

    def test_onboarding_symptoms_are_safety_checked(self):
        response = self.onboard(symptoms=["Back ache"])
        self.assertEqual(response.status_code, 200)
        check = response.json()["symptom_checks"][0]
        self.assertEqual(check["symptom"], "Back ache")
        self.assertIn(check["route"], {"urgent", "needs_clarification", "non_urgent"})

    def test_urgent_onboarding_is_blocked_before_product_navigation(self):
        response = self.onboard(symptoms=["I cannot breathe right now"])
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["safety_blocked"])
        check = body["symptom_checks"][0]
        self.assertEqual(check["route"], "urgent")
        self.assertFalse(check["ordinary_generation_allowed"])
        self.assertTrue(check["matched_rule_ids"])
        self.assertEqual(check["stop_reason"], "urgent_match")

    def test_ambiguous_onboarding_symptom_requires_clarification(self):
        response = self.onboard(symptoms=["I feel nauseous right now"])
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["safety_blocked"])
        check = body["symptom_checks"][0]
        self.assertEqual(check["route"], "needs_clarification")
        self.assertFalse(check["ordinary_generation_allowed"])

    def test_month_due_date_and_postpartum_date_are_resolved(self):
        month = self.onboard(timeline_mode="month", timeline_value="6")
        self.assertEqual(month.status_code, 200)
        self.assertIsNotNone(month.json()["journey"]["range_start"])

        due = self.onboard(
            timeline_mode="due",
            timeline_value=(date.today() + timedelta(days=100)).isoformat(),
        )
        self.assertEqual(due.status_code, 200)
        self.assertEqual(due.json()["journey"]["unit"], "week")

        postpartum = self.onboard(
            journey="postpartum",
            timeline_mode="birth_date",
            timeline_value=(date.today() - timedelta(days=10)).isoformat(),
        )
        self.assertEqual(postpartum.status_code, 200)
        self.assertEqual(postpartum.json()["journey"]["stage"], "postpartum")

    def test_chat_runs_existing_safety_and_validation_path(self):
        self.onboard()
        response = self.client.post(
            "/v1/demo/chat",
            json={"session_id": self.session_id, "text": "Show meal options"},
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["fictional"])
        self.assertIn(body["display"]["route"], {"validated", "abstained"})

    def test_urgent_chat_bypasses_ordinary_generation(self):
        self.onboard()
        response = self.client.post(
            "/v1/demo/chat",
            json={"session_id": self.session_id, "text": "I cannot breathe right now"},
        )
        self.assertEqual(response.status_code, 200)
        display = response.json()["display"]
        self.assertEqual(display["route"], "urgent")
        self.assertEqual(display["ordinary_generation_calls"], 0)

    def test_demo_sessions_are_isolated(self):
        self.onboard(name="First", timeline_value="26", allergies=["Peanut"])
        other_session = self.client.post("/v1/demo/session").json()["session_id"]
        other = self.client.post(
            "/v1/demo/onboarding",
            json={
                "session_id": other_session,
                "name": "Second",
                "journey": "pregnant",
                "timeline_mode": "week",
                "timeline_value": "31",
                "diets": [],
                "allergies": ["Sesame"],
                "symptoms": [],
                "use_fictional_sample_record": False,
            },
        )
        self.assertEqual(other.status_code, 200)
        first_home = self.client.get(f"/v1/demo/home/{self.session_id}").json()
        second_home = self.client.get(f"/v1/demo/home/{other_session}").json()
        self.assertEqual(first_home["journey"]["exact"], 26)
        self.assertEqual(first_home["confirmed_context"]["allergies"], ["Peanut"])
        self.assertEqual(second_home["journey"]["exact"], 31)
        self.assertEqual(second_home["confirmed_context"]["allergies"], ["Sesame"])

    def test_connected_week_runs_plan_composer_and_validator(self):
        self.onboard()
        response = self.client.post(
            "/v1/demo/plan",
            json={
                "session_id": self.session_id,
                "horizon": "week",
                "focus": "balanced",
            },
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["fictional"])
        self.assertIsNotNone(body["schedule"])
        self.assertTrue(body["display"]["validation_display_allowed"])

    def test_real_upload_is_not_misrepresented(self):
        self.onboard(use_fictional_sample_record=False)
        response = self.client.post(f"/v1/demo/document-sample/{self.session_id}")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Real medical file upload is not enabled", response.json()["warning"])

    def test_session_validation_supports_stale_browser_recovery(self):
        valid = self.client.get(f"/v1/demo/session/{self.session_id}")
        self.assertEqual(valid.status_code, 200)
        self.assertFalse(valid.json()["onboarding_complete"])
        missing = self.client.get(f"/v1/demo/session/{uuid4()}")
        self.assertEqual(missing.status_code, 404)

    def test_home_cards_are_governed_and_keep_gated_sections_visible(self):
        self.onboard()
        home = self.client.get(f"/v1/demo/home/{self.session_id}").json()
        self.assertGreaterEqual(len(home["content_cards"]), 7)
        required = {
            "card_id", "domain", "title", "summary", "journey_scope",
            "evidence_ids", "review_state", "display_allowed", "limitations",
            "suggested_action",
        }
        self.assertTrue(all(required <= set(card) for card in home["content_cards"]))
        self.assertTrue(all(not card["display_allowed"] for card in home["content_cards"]))
        self.assertFalse(home["public_release_available"])

    def test_month_range_never_becomes_an_exact_comparison(self):
        response = self.onboard(timeline_mode="month", timeline_value="6")
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json()["journey"]["exact"])
        home = self.client.get(f"/v1/demo/home/{self.session_id}").json()
        preview = home["comparison_preview"]
        self.assertEqual(preview["display_mode"], "range_confirmation")
        self.assertFalse(preview["eligible_context"])
        self.assertIsNone(preview["exact_week"])

    def test_exact_week_uses_editorial_preview_with_measurements_gated(self):
        self.onboard(timeline_mode="week", timeline_value="26")
        preview = self.client.get(f"/v1/demo/home/{self.session_id}").json()["comparison_preview"]
        self.assertEqual(preview["display_mode"], "exact_week_editorial_preview")
        self.assertEqual(preview["exact_week"], 26)
        self.assertEqual(preview["approval_reviewer"], "Kajal")
        self.assertEqual(preview["approval_date"], "2026-09-11")
        self.assertEqual(preview["measurement_review_state"], "pending")
        self.assertEqual(preview["image_ownership_or_licence"], "pending")
        self.assertEqual(len(preview["catalogue_sha256"]), 64)

    def test_postpartum_never_receives_pregnancy_comparison(self):
        response = self.onboard(
            journey="postpartum",
            timeline_mode="birth_date",
            timeline_value=(date.today() - timedelta(days=10)).isoformat(),
        )
        self.assertEqual(response.status_code, 200)
        home = self.client.get(f"/v1/demo/home/{self.session_id}").json()
        self.assertEqual(home["comparison_preview"]["display_mode"], "postpartum_hidden")
        self.assertFalse(home["comparison_preview"]["eligible_context"])

    def test_missing_context_is_not_reported_as_none(self):
        self.onboard(
            diets=[], allergies=[], symptoms=[], use_fictional_sample_record=False,
        )
        home = self.client.get(f"/v1/demo/home/{self.session_id}").json()
        self.assertEqual(home["confirmed_context"]["diets_status"], "not_provided")
        self.assertEqual(home["confirmed_context"]["allergies_status"], "not_provided")
        self.assertEqual(home["records"][0]["status"], "not_provided")


if __name__ == "__main__":
    unittest.main()
