import Image from "next/image";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

export const Footer = () => {
  return (
    <footer className="w-full bg-gray-50 border-t">
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center mb-3 gap-2">
            <Image
              src="/images/monetira-icon-desc.svg"
              alt="Logo"
              width={220}
              height={220}
              draggable="false"
            />
          </div>
          <p className="text-gray-600 text-sm">
            Kelola keuangan lebih mudah. Catat, atur, dan capai tujuan
            finansialmu.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Produk</h4>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>
              <a href="#" className="hover:text-blue-600">
                Manajemen Keuangan
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600">
                Tabungan
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600">
                Split Bill
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600">
                Arisan
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600">
                Hutang Piutang
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Perusahaan</h4>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>
              <a href="#" className="hover:text-blue-600">
                Tentang Kami
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600">
                Kontak
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600">
                Karir
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Ikuti Kami</h4>
          <div className="flex gap-4">
            <a href="#" className="text-gray-500 hover:text-blue-600">
              <FaTwitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600">
              <FaFacebookF className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600">
              <FaInstagram className="h-5 w-5" />
            </a>
          </div>
          <p className="text-gray-600 text-sm mt-4 flex items-center flex-nowrap gap-2">
            <MdEmail className="h-5 w-5" /> support@monetira.com
          </p>
        </div>
      </div>

      <div className="border-t py-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Monetira. Semua hak dilindungi.
      </div>
    </footer>
  );
};
