import { BadgeInfo } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { useState } from "react";

interface InformationalIconProps {
    content: any;
}

const InformationalIcon = ({ content }: InformationalIconProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLocked(prev => !prev);
    };

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
        >
            <BadgeInfo
                data-tooltip-id={content.id + "info-tooltip"}
            />
            <Tooltip
                id={content.id + "info-tooltip"}
                className="tooltip"
                style={{ maxWidth: "30%" }}
                isOpen={isHovered || isLocked}
                render={() => (
                    <div
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <p>{content.blurb}</p>
                        {content.docLinks.length > 0 && (
                            <>
                                <p>For more information, please see:</p>
                                {content.docLinks.map((item: Record<string, string>) =>
                                    Object.entries(item).map(([label, href]) => (
                                        <a key={href} href={href}>{label}</a>
                                    ))
                                )}
                            </>
                        )}
                    </div>
                )}
            />
        </div>
    );
};

export default InformationalIcon;