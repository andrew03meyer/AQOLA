import { BadgeInfo } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { useState } from "react";

interface InformationalIconProps {
    content: any;
}

const InformationalIcon = ({ content }: InformationalIconProps) => {
    const [boxHovered, setBoxHovered] = useState(false);
    const [iconHovered, setIconHovered] = useState(false);

    return (
        <>
            <BadgeInfo
                data-tooltip-id={content.id + "info-tooltip"}
                onMouseOver={() => setIconHovered(true)}
                onMouseLeave={() => setIconHovered(false)}
            />
            <Tooltip
                id={content.id + "info-tooltip"}
                className="tooltip"
                style={{ maxWidth: "50%" }}
                delayHide={500}
            >
                <div>
                    <div>{content.blurb}</div>
                    <div style={{padding: "5px", fontStyle:"italic", fontSize:"10px"}}>For more information, please see documentation</div>
                </div>
            </Tooltip>
        </>
    );
};

export default InformationalIcon;