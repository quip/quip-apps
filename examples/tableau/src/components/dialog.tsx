import quip from "quip-apps-api";
import React, {ReactNode, useEffect, useRef} from "react";

interface DialogProps {
    onDismiss: () => void;
    children: ReactNode;
    title: string;
    noBackdrop?: boolean;
}

const Dialog = (props: DialogProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // mount
        if (!props.noBackdrop) {
            quip.apps.showBackdrop(props.onDismiss);
        }
        if (containerRef.current) {
            quip.apps.addDetachedNode(containerRef.current);
        }

        return () => {
            if (!props.noBackdrop) {
                quip.apps.dismissBackdrop();
            }
            if (containerRef.current) {
                quip.apps.removeDetachedNode(containerRef.current);
            }
        };
    }, []);

    const dimensions = quip.apps.getCurrentDimensions();
    const style: React.CSSProperties = {
        // @ts-ignore
        width: dimensions.width,
        // @ts-ignore
        height: dimensions.height,
    };
    return (
        <div ref={containerRef} style={style} className="dialog">
            <div className="modal">
                <div className="header">{props.title}</div>
                {props.children}
            </div>
        </div>
    );
};

export default Dialog;
