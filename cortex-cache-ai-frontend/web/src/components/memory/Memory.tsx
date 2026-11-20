import Header from "../complete/Header"
import MemoryShowcase from "./MemoryShowcase"

const Memory = () => {
  return (
    <div className="no-scroll-bar flex flex-col content-between overflow-x-h-full max-w-6xl mx-auto px-4 wd-8 h-full">
      <div className="">
        <Header interactionTitle={'Add Memory'} handleButtonClicked={() => { }} central="MindKeeper AI" />
      </div>
      <div className="min-h-full flex flex-col justify-center item-center">
        <div className="h-fit overflow-auto no-scroll-bar">
          <MemoryShowcase />
        </div>
      </div>
    </div>
  )
}

export default Memory