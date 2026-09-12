export type BabyGrowthWeek = {
  week: number;
  comparison: string;
  length: string;
  weight: string;
  babyAsset: string | null;
  comparisonAsset: string | null;
  visualScale: number;
  developmentStage: string;
};

const developmentStage = (week:number) => week <= 2 ? "Pregnancy dating begins before an embryo is visible" : week <= 8 ? "Brain, spine, facial structures and limb buds are forming" : week <= 12 ? "Limbs, eyelids and early organ systems are developing" : week <= 16 ? "Bones are hardening and the neck and lower limbs are defined" : week <= 20 ? "Features are increasingly recognisable and movement systems are developing" : week <= 24 ? "Stronger movement, developing reflexes and early fat beneath the skin" : week <= 28 ? "Lung and nervous-system development with smoother skin" : week <= 32 ? "Rapid weight gain, grasping movements and light sensitivity" : week <= 36 ? "More body fat, firmer bones and a possible head-down position" : "Final maturation of the lungs, brain and nervous system";
const row = (week:number, comparison:string, length:string, weight:string, comparisonAsset:string|null, babyAsset:string|null, visualScale:number):BabyGrowthWeek => ({week,comparison,length,weight,comparisonAsset,babyAsset,visualScale,developmentStage:developmentStage(week)});

export const babyGrowthLibrary: BabyGrowthWeek[] = [
  row(1,"No embryo-size comparison yet","Not measurable","Not measurable",null,null,.34),
  row(2,"No embryo-size comparison yet","Not measurable","Not measurable",null,null,.35),
  row(3,"Speck of fine sand","Microscopic","Not measurable",null,"/babies/week-05.png",.36),
  row(4,"Poppy seed","~1 mm","<1 g","/comparisons/poppy-seed.png","/babies/week-05.png",.38),
  row(5,"Sesame seed","~2 mm","<1 g","/comparisons/sesame-seed.png","/babies/week-05.png",.40),
  row(6,"Lentil","~6 mm","<1 g","/comparisons/lentil.png","/babies/week-05.png",.42),
  row(7,"Blueberry","~10 mm","<1 g","/comparisons/blueberry.png","/babies/week-08.png",.44),
  row(8,"Pumpkin seed","~16 mm","~1 g","/comparisons/pumpkin-seed.png","/babies/week-08.png",.46),
  row(9,"Rajma bean","~22 mm","~2 g","/comparisons/rajma-bean.png","/babies/week-08.png",.48),
  row(10,"Cherry","~30 mm","~4 g","/comparisons/cherry.png","/babies/week-12.png",.50),
  row(11,"Strawberry","~41 mm","~7 g","/comparisons/strawberry.png","/babies/week-12.png",.52),
  row(12,"Small lime","~5.4 cm","~14 g","/comparisons/lime.png","/babies/week-12.png",.54),
  row(13,"Lemon","~7.4 cm","~23 g","/comparisons/lemon.png","/babies/week-12.png",.56),
  row(14,"Guava","~8.7 cm","~90 g","/comparisons/guava.png","/babies/week-16.png",.58),
  row(15,"Sweet lime / mosambi","~10.1 cm","~114 g","/comparisons/lime.png","/babies/week-16.png",.60),
  row(16,"Avocado","~11.6 cm","~144 g","/comparisons/avocado.png","/babies/week-16.png",.62),
  row(17,"Pomegranate","~13 cm","~179 g","/comparisons/pomegranate.png","/babies/week-16.png",.64),
  row(18,"Bell pepper / shimla mirch","~14.2 cm","~222 g","/comparisons/bell-pepper.png","/babies/week-16.png",.66),
  row(19,"Mango","~15.3 cm","~272 g","/comparisons/mango.png","/baby-week-22.png",.68),
  row(20,"Small orange","~25.6 cm","~330 g","/comparisons/orange.png","/baby-week-22.png",.70),
  row(21,"Orange","~26.7 cm","~398 g","/comparisons/orange.png","/baby-week-22.png",.72),
  row(22,"Grapefruit","~27.8 cm","~525 g","/comparisons/grapefruit.png","/baby-week-22.png",.74),
  row(23,"Grapefruit","~28.9 cm","~592 g","/comparisons/grapefruit.png","/baby-week-22.png",.76),
  row(24,"Small muskmelon","~30 cm","~668 g","/comparisons/muskmelon.png","/baby-week-22.png",.78),
  row(25,"Small muskmelon","~34.6 cm","~756 g","/comparisons/muskmelon.png","/babies/week-26-reference.png",.80),
  row(26,"Papaya","~35.6 cm","~856 g","/comparisons/papaya-reference-v2.png","/babies/week-26-reference.png",.82),
  row(27,"Cauliflower","~36.6 cm","~969 g","/comparisons/cauliflower.png","/babies/week-26-reference.png",.84),
  row(28,"Cabbage","~37.6 cm","~1,097 g","/comparisons/cabbage.png","/babies/week-26-reference.png",.86),
  row(29,"Cabbage","~38.6 cm","~1,239 g","/comparisons/cabbage.png","/babies/week-26-reference.png",.88),
  row(30,"Cabbage","~39.9 cm","~1,396 g","/comparisons/cabbage.png","/babies/week-26-reference.png",.90),
  row(31,"Honeydew melon","~41.1 cm","~1,568 g","/comparisons/honeydew-melon.png","/babies/week-26-reference.png",.92),
  row(32,"Honeydew melon","~42.4 cm","~1,755 g","/comparisons/honeydew-melon.png","/babies/week-26-reference.png",.94),
  row(33,"Small watermelon","~43.7 cm","~1,954 g","/comparisons/watermelon.png","/baby-week-22.png",.95),
  row(34,"Muskmelon","~45 cm","~2,162 g","/comparisons/muskmelon.png","/baby-week-22.png",.96),
  row(35,"Large honeydew melon","~46.2 cm","~2,378 g","/comparisons/honeydew-melon.png","/baby-week-22.png",.97),
  row(36,"Large muskmelon","~47.4 cm","~2,594 g","/comparisons/muskmelon.png","/baby-week-22.png",.98),
  row(37,"Small pumpkin","~48.6 cm","~2,806 g","/comparisons/pumpkin.png","/baby-week-22.png",.99),
  row(38,"Medium pumpkin","~49.8 cm","~3,006 g","/comparisons/pumpkin.png","/baby-week-22.png",1),
  row(39,"Small watermelon","~50.7 cm","~3,186 g","/comparisons/watermelon.png","/baby-week-22.png",1.01),
  row(40,"Full-size watermelon","~51.2 cm","~3,338 g","/comparisons/watermelon.png","/baby-week-22.png",1.02),
  row(41,"Large watermelon","~51.7 cm","~3,500 g","/comparisons/watermelon.png","/baby-week-22.png",1.03),
];

export const getBabyGrowth = (week:number) => babyGrowthLibrary[Math.max(1,Math.min(41,week))-1];
