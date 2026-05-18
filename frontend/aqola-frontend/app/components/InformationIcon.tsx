import { BadgeInfo } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { useState } from "react";
interface InformationalIconProps {
    content: any;
}



const InformationalIcon = ({ content }: InformationalIconProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isClicked, setIsClicked] = useState(false)

    const openTest = () => {
        if(!isClicked){
            setIsOpen(false)
        }
    }

    return (
        <div 
            onMouseOver={() => setIsOpen(true)}
            onMouseOut={() => openTest()}
            onMouseDown={() => setIsClicked(prev => !prev)}
        >
            <BadgeInfo
                data-tooltip-id={content.id + "-info-tooltip"}
                className="titlebar-contents"
            />
            <Tooltip
                id={content.id + "-info-tooltip"}
                className="tooltip"
                style={{ 
                    maxWidth: "50%", 
                    borderRadius:"10px",
                    zIndex: 4000
                }}
                delayHide={500}
                clickable={true}
                isOpen={isOpen}
                
            >
                <div>
                    <div>{content.blurb}</div>
                    <div style={{padding: "5px", fontStyle:"italic", fontSize:"10px"}}>For more information, please see documentation</div>
                </div>
            </Tooltip>
        </div>
    );
};

export default InformationalIcon;