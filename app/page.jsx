import Banner from "@components/honePageComponent/Banner";
import Hero from "@components/honePageComponent/Hero";
import MostViewedPosts from "@components/honePageComponent/MostViewedPosts";
import NewestArticles from "@components/honePageComponent/NewestArticles";
import TopCategoriesWithPosts from "@components/honePageComponent/TopCategoriesWithPosts";
import WeeklyHighlights from "@components/honePageComponent/WeeklyHighlights";

const Home = () => (
  <section className="w-full flex-center flex-col">
    <Hero />
    <MostViewedPosts />
    <NewestArticles />
    <Banner />
    <TopCategoriesWithPosts />
    <WeeklyHighlights />
  </section>
);

export default Home;
