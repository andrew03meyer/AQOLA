import { useState } from "react"
import { Rnd } from "react-rnd"

const content = [
    "Click here to change dataset", 
    "Use these buttons to save your work and come back later",
    "Use this bar to open up new charts. Hover the icon to get more information about that graph"
]
const location = [
    [100, 100],
    [200, 200],
    [300, 300]
]

// const nextStage = (index: number) => {
//     const item = document.getElementById(index + "-tutorial")
//     item?.style.property()
// }

const Tutorial = () => {
    const [stage, setStage] = useState(0)
    const [finished, setFinished] = useState(false)

    if (finished) return null;


    return(
        content.map((val, index) => {
            return(
                <Rnd
                    default={{ x: location[index][0], y: location[index][1], width: 300, height: 100 }}
                    bounds="parent"
                    style={{ 
                        zIndex: 4000,
                        visibility: index === stage ? "visible" : "hidden"
                    }}
                    disableDragging
                    enableResizing={false}
                    className="rnd-window"  
                    id={index + "-tutorial"}
                >
                    <div>{val}</div>
                    <button onClick={() => setStage(+1)}>Next</button>
                    <button onClick={() => setFinished(true)}>Skip</button>
                </Rnd>
            )
        })
    )
}

export default Tutorial