declare module '*.svg' {
    import React from 'react'

    const ReactComponent: React.ForwardRefExoticComponent<
        React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & React.RefAttributes<SVGSVGElement>
    >
    export default ReactComponent
}
