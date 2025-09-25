import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
    return (
        <Link className="flex items-center gap-2" href="/">
            <Image
                src={"/images/monetira-icon.svg"}
                alt="monetira-icon"
                height={35}
                width={35}
            />
            <span className="text-xl font-bold text-primary dark:text-white">
                Monetira
            </span>
        </Link>
    );
};