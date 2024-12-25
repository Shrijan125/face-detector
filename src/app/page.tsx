import { Button } from "@/components/ui/button";
import Image from "next/image";
import Logo from '../../public/logo.svg'
import Github from '../../public/github-mark-white.svg'
import Link from "next/link";

export default function Home() {
  return (
    <div className="mt-5">
        <div className="flex items-center gap-5">
          <div className="relative w-12 h-12">
            <Image alt="logo" src={Logo} fill className="object-cover"></Image>
          </div>
          <span className="text-2xl text-purple-200 font-bold">FaceLens</span>
          <div className='bg-white p-[2px] mt-[6px] rounded-xl bg-gradient-to-r from-primary to-brand-primaryBlue sm:w-[200px]'>
            <Button variant={'secondary'} className='w-full rounded-[10px] p-2 text-xl' asChild>
                <Link href={'/recorder'} target="_blank" className="flex items-center justify-center gap-2">
                <div className="relative">
                  <Image src={Github} alt="logo" width={20} height={20} />
                </div>
                Github
                </Link>
            </Button>
        </div>
        </div>
    </div>
  );
}
