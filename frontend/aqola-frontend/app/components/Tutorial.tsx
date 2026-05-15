import { useEffect, useState } from "react"
import { Rnd } from "react-rnd"
import { useAppStore } from "../store/AppStore"

const content = [
    "Click here to change dataset",
    "Use this bar to open up new charts. Hover the icon to get more information about that graph",
    "Use these buttons to save your work and come back later",
]

const Tutorial = () => {
    const [locations, setLocations] = useState([[0, 0], [0, 0], [0, 0]])
    const [location, setLocation] = useState<number[]>([])
    const [ready, setReady] = useState(false)
    const [stage, setStage] = useState(0)
    const [showWelcome, setShowWelcome] = useState(true)
    const tutorialDone = useAppStore((state) => state.tutorialDone);
    const setTutorialDone = useAppStore((state) => state.setTutorialDone)

    useEffect(() => {
        const w = screen.width
        const h = screen.height
        setLocations([
            [w * 0.015, h * 0.06],
            [w * 0.25,  h * 0.6],
            [w * 0.1,   h * 0.06],
        ])
        setLocation([w * 0.25, h * 0.25])
        setReady(true)
    }, [])

    if (!ready || tutorialDone) return null

    return (
        <>
            <Rnd
                default={{ x: location[0], y: location[1], width: "auto", height: "auto" }}
                style={{ visibility: showWelcome ? "visible" : "hidden", alignItems: "center", alignContent: "center", display: "flex", flexDirection: "column" }}
                className="rnd-window"
            >
                <button className="button" style={{ alignSelf: "flex-end" }} onMouseDown={() => setShowWelcome(false)}>✕</button>
                <img src="koala.png" style={{ borderRadius: "20px", width: "50px", height: "50px" }} />
                <div>Welcome to AQOLA. The tool designed to help you with all your locational data needs!</div>
                <div>There is a quick tutorial to show you round. If you have any questions, please go see our <a href="/docs" style={{ color: "teal" }}>documentation</a></div>
            </Rnd>

            {content.map((val, index) => (
                <Rnd
                    key={index}
                    default={{
                        x: locations[index][0],
                        y: locations[index][1],
                        width: "auto",
                        height: "auto",
                    }}
                    bounds="parent"
                    style={{
                        zIndex: 4000,
                        visibility: index === stage ? "visible" : "hidden",
                        marginBottom: 0,
                        paddingBottom: 0,
                    }}
                    disableDragging
                    enableResizing={false}
                    className="rnd-window"
                    id={index + "-tutorial"}
                >
                    <div className="docs">{val}</div>

                    <div className="flex-row" style={{ background: "rgba(15, 30, 40, 0.55)" }}>
                        {index !== 0 && (
                            <button className="button" onClick={() => setStage(prev => prev - 1)}
                                style={{ 
                                    alignSelf: "flex-start", 
                                    fontStyle: "italic", 
                                    width: "25%", 
                                    textAlign: "right", 
                                    fontSize: "16px",
                                }}>
                                Prev
                            </button>
                        )}
                        <button className="button"
                            onClick={() => index === content.length - 1 ? setTutorialDone(true) : setStage(prev => prev + 1)}
                            style={{ alignSelf: "flex-start", fontStyle: "italic", width: "25%", textAlign: "left", fontSize: "16px" }}>
                            {stage === content.length - 1 ? "Finish" : "Next"}
                        </button>
                        {stage !== content.length - 1 &&
                            <button className="button" onClick={() => setTutorialDone(true)}
                                style={{ alignSelf: "flex-end", marginRight: "12px", fontStyle: "italic", width: "50%", textAlign: "right", fontSize: "16px" }}>
                                Skip
                            </button>
                        }
                    </div>
                </Rnd>
            ))}
        </>
    )
}

export default Tutorial