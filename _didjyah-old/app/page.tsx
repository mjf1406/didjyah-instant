import DidjyahList from "@/components/didjyahs/DidjyahList";
import Navbar from "@/components/NavBar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="p-2 md:p-4">
        <DidjyahList />
      </main>
    </>
  );
}
