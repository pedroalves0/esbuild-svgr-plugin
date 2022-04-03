declare module '*.xml' {
    import React from 'react'

    const ReactComponent: React.ForwardRefExoticComponent<
        React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & React.RefAttributes<SVGSVGElement>
    >
    export default ReactComponent
}
