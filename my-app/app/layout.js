import "./globals.css";
import { SocketProvider } from "../context/SocketContext";
import { AuthProvider } from "../context/AuthContext";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsappButton from "../components/layout/WhatsappButton";
import ScrollToTop from "../components/layout/ScrollToTop";
export const metadata={ title:"شركة برمجية - حلول رقمية متكاملة", description:"شريكك التقني الموثوق" };
export default function RootLayout({children}){
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>
          <SocketProvider>
            <Header/>
            <main className="min-h-screen">{children}</main>
            <Footer/>
            <WhatsappButton/>
            <ScrollToTop/>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
