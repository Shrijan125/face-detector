import React from 'react'
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Logo from '../../public/logo.svg';
import Github from '../../public/github-mark-white.svg';
import Link from 'next/link';
import { Video } from 'lucide-react';

const Navbar = () => {
  return (
    <div className="mt-5 flex justify-between mx-5">
      <div className="flex items-center gap-5">
        <Link href={'/'}>
        <div className="relative w-12 h-12 hover:cursor-pointer">
          <Image alt="logo" src={Logo} fill className="object-cover"></Image>
        </div>
        </Link>
        <span className="text-2xl text-purple-200 font-bold sm:block hidden select-none">FaceLens</span>
      </div>
      <div className='flex gap-5'>
      <div className="p-[2px] mt-[6px] rounded-xl  sm:w-[200px] border-2 border-bgPrimary">
      
        <Button className="w-full rounded-[10px] py-4 px-6 sm:p-2 text-xl" asChild>
       
          <Link
            href={'/recorder'}
            className="flex items-center justify-center gap-2"
          >
             <Video/>
            <span className='sm:block hidden p-4'>Recorder</span>
          </Link>
        </Button>
      </div>
      <div className="bg-white p-[2px] mt-[6px] rounded-xl bg-gradient-to-r from-primary to-brand-primaryBlue sm:w-[200px]">
        <Button
          variant={'outline'}
          className="w-full rounded-[10px] py-4 px-6 sm:p-2 text-xl"
          asChild
        >
          <Link
            href={'https://github.com/Shrijan125/face-detector'}
            target="_blank"
            className="flex items-center justify-center gap-2"
          >
            <div className="relative">
              <Image src={Github} alt="logo" width={20} height={20} />
            </div>
           <span className='sm:block hidden'>Github</span>
          </Link>
        </Button>
      </div>
      </div>
    </div>
)
}

export default Navbar