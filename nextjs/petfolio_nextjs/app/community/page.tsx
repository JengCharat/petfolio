
import Navbar from "../components/Navbar";


export default function Community(){
    return (
        <> 
    <div className="flex flex-col min-h-screen w-full bg-[#f5f5f5]">
  <Navbar />

  <div className=" flex px-80 gap-4 items-start mt-8">
    {/* Left Sidebar */}
    <div className="border w-64  border-gray-300 px-4 pt-8 sticky top-32 self-start">
      <p className="text-black">Option1</p>
      <p className="text-black">Option2</p>
      <p className="text-black">Option3</p>
      <p className="text-black">Option4</p>
    </div>

    {/* Center Column */}
    <div className="flex-1 flex flex-col space-y-4 border-l border-r">
      {/* Create Post */}
      <div className=" border-b border-gray-300 pt-12 w-full ">
        {/* ช่องสร้างโพส */}
        <div className="p-4 text-black">
            สร้างโพส
        </div>     
      </div>

      {/* FEED */}
      <div className="  rounded-lg  w-full">
        {[...Array(20)].map((_, i) => (
          <div key={i} className=" border-b border-gray-300 p-4 text-black">
            Post {i + 1}
          </div>
        ))}
      </div>
    </div>

    {/* Right Sidebar */}
    <div className="border w-64  border-gray-300 px-4 pt-8 sticky top-32 self-start">
      <p className="text-black">Option1</p>
      <p className="text-black">Option2</p>
      <p className="text-black">Option3</p>
      <p className="text-black">Option4</p>
    </div>
  </div>
</div>







       

        


        


        </>
    )
}