import Image from "next/image"
export default function Home() {
  return (
    <>
    <div className="sm:h-[560px] sm:w-[720px] relative mx-auto mt-10 h-[300px] w-[400px]">
      <Image src='/home.png' alt="homeimage" fill className="object-cover"></Image>
      
    </div>
    <div className="sm:text-2xl text-center mx-auto w-full text-purple-200 text-xl whitespace-nowrap">Track your Face with FACELENS!</div> 
    </>
  );
}
