import { useEffect, useState } from "react"
import { Rnd } from "react-rnd"

const content = [
    "Click here to change dataset", 
    "Use this bar to open up new charts. Hover the icon to get more information about that graph",
    "Use these buttons to save your work and come back later",
]

const location = [
    [screen.width * 0.015, screen.height * 0.06],
    [screen.width * 0.25, screen.height * 0.74],
    [screen.width * 0.1, screen.height * 0.06],
]

// const nextStage = (index: number) => {
//     const item = document.getElementById(index + "-tutorial")
//     item?.style.property()
// }

const Tutorial = () => {
    const [stage, setStage] = useState(0)
    const [finished, setFinished] = useState(false)
    const [showWelcome, setShowWelcome] = useState(true)

    if (finished) return null;


    return(
        <>
            {/* Welcome menu */}
            <Rnd
                default={{x: screen.width * 0.25, y: screen.height * 0.25, width: "auto", height: "auto"}}
                style={{visibility: showWelcome === true ? "visible": "hidden", alignItems:"center", alignContent:"center", display:"flex", flexDirection:"column"}}
                className="rnd-window"
            >
                <button className="button" style={{alignSelf:"flex-end"}} onMouseDown={() => setShowWelcome(false)}> ✕ </button>
                <img src="koala.png" style={{borderRadius: "20px", width:"50px", height:"50px"}} />
                <div>Welcome to AQOLA. The tool designed to help you with all your locational data needs!</div>
                <div>There is a quick tutorial to show you round. If you have any questions, please go see our <a href="/docs">documentation</a></div>
            </Rnd>

            {/* Rendering all the informational icons */}
            {content.map((val, index) => {
                return(
                    <Rnd
                        default={{ 
                            x: location[index][0] as number, 
                            y: location[index][1] as number, 
                            width: "auto", 
                            height: "auto" 
                        }}
                        bounds="parent"
                        style={{ 
                            zIndex: 4000,
                            visibility: index === stage ? "visible" : "hidden",
                            marginBottom:0,
                            paddingBottom:0,
                        }}
                        disableDragging
                        enableResizing={false}
                        className="rnd-window"  
                        id={index + "-tutorial"}
                    >
                        <div className="docs">{val}</div>
                        
                        <div className="flex-row" style={{background:"rgba(15, 30, 40, 0.55)"}}>
                              {/* Prev */}
                            <button 
                                className="button" 
                                onClick={() => setStage(prev => prev - 1)} 
                                style={{
                                    alignSelf:"flex-start", 
                                    fontStyle:"italic",
                                    width:"25%",
                                    textAlign: "right",
                                    fontSize:"16px",
                                    }}>
                                Prev
                            </button>
                            {/* Next and Finished Button */}
                            <button 
                                className="button" 
                                onClick={() => setStage(prev => prev + 1)} 
                                style={{
                                    alignSelf:"flex-start", 
                                    fontStyle: "italic",
                                    width:"25%",
                                    textAlign:"left",
                                    fontSize:"16px",
                                    }}>
                                {stage === content.length-1 ? "Finished": "Next"}
                            </button>


                            
                            {/* Skip Button */}
                            {stage !== content.length-1 && 
                                <button 
                                    className="button" 
                                    onClick={() => setFinished(true)} 
                                    style={{
                                        alignSelf:"flex-end", 
                                        marginRight:"12px", 
                                        fontStyle:"italic",
                                        width:"50%",
                                        textAlign: "right",
                                        fontSize:"16px",
                                    }}>
                                    Skip
                                </button>}
                        </div>
                    </Rnd>
                ) 
            })}
        </>
    )
}

export default Tutorial