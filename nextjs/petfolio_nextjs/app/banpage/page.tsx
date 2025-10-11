import Navbar from "../components/Navbar";

export default function BanPage() {
  return (
        <>
      <Navbar />
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-semibold text-red-600 mb-4">
          คุณถูกแบน
        </h1>
        <p className="text-xl text-gray-700 mb-6">
          เดี๋ยว admin มาปลดแบนให้เร็วๆ นี้
        </p>
        <p className="text-sm text-gray-500">
          ขออภัยในความไม่สะดวก โปรดติดต่อฝ่ายสนับสนุนหากต้องการข้อมูลเพิ่มเติม
        </p>
      </div>
    </>
  );
}
