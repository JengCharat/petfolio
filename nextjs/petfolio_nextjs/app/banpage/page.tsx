import Navbar from "../components/Navbar";

export default function BanPage() {
  return (
        <>
        <div className="font-sans">
          <Navbar />
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-semibold text-red-600 mb-4">
          คุณถูกระงับการใช้งานจากระบบ
        </h1>
        <p className="text-xl text-gray-700 mb-6">
          กรุณาติดต่อ Admin เพื่อทำการปลดแบน 
        </p>
        <p className="text-sm text-gray-500">
          ขออภัยในความไม่สะดวก โปรดติดต่อฝ่ายสนับสนุนหากต้องการข้อมูลเพิ่มเติม
        </p>
      </div>
        </div>
      
    </>
  );
}
