import { useCallback, useEffect, useRef, useState } from "react"

const images = [
  "https://placekitten.com/500/200",
  "https://placekitten.com/700/800",
  "https://placekitten.com/50/200",
  "https://placekitten.com/500/800",
]

interface Image {
  id: string
  src: string
  position: { x: number; y: number; z: number }
}

interface ImageRotation {
  beta: number
  gamma: number
}

const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max)
}

function App() {
  const [gifs, setGifs] = useState<Image[]>([
    {
      id: "1",
      src: images[0],
      position: { x: 0.5, y: 0.5, z: 0.5 },
    },
    {
      id: "2",
      src: images[1],
      position: { x: 0.5, y: 0.7, z: 0.0 },
    },
    {
      id: "3",
      src: images[1],
      position: { x: 0.1, y: 0, z: 0.0 },
    },
  ])

  useEffect(() => {
    // position in pixels
    const lastMousePosition = { x: 0, y: 0 }

    const handleMouseMove = (event: MouseEvent) => {
      const x = event.clientX
      const y = event.clientY

      // threashold in pixels
      const distanceTheshold = 200

      if (
        getDistance(x, y, lastMousePosition.x, lastMousePosition.y) >
        distanceTheshold
      ) {
        setGifs((gifs) => {
          const newGif = {
            id: Math.random().toString(),
            src: images[Math.floor(Math.random() * images.length)],
            position: {
              x: x / window.innerWidth,
              y: y / window.innerHeight,
              z: 0,
            },
          }

          return [...gifs, newGif]
        })

        lastMousePosition.x = x
        lastMousePosition.y = y
      }
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [setGifs])

  const gifContainer = useRef<HTMLDivElement | null>(null)

  const handleOrientationPermission = useCallback(() => {
    const orientationEvent = DeviceOrientationEvent as any
    if (typeof orientationEvent.requestPermission === "function") {
      orientationEvent.requestPermission()
    }
  }, [])

  // effect for device orientation
  useEffect(() => {
    let isActive = true

    const imagesRotation: ImageRotation = { beta: 0, gamma: 0 }

    const prevRotation: ImageRotation = { beta: 0, gamma: 0 }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null) return
      if (event.gamma === null) return

      const addedRotation: ImageRotation = {
        beta: prevRotation.beta - event.beta,
        gamma: prevRotation.gamma - event.gamma,
      }

      addedRotation.beta = clamp(addedRotation.beta, -5, 5)
      addedRotation.gamma = clamp(addedRotation.gamma, -5, 5)

      prevRotation.beta = event.beta
      prevRotation.gamma = event.gamma

      imagesRotation.beta -= addedRotation.beta
      imagesRotation.gamma -= addedRotation.gamma
    }

    const frameHandler = () => {
      if (!isActive) return
      if (!gifContainer.current) return

      if (imagesRotation.beta === 0 && imagesRotation.gamma === 0) {
        window.requestAnimationFrame(frameHandler)
        return
      }

      Array.from(
        gifContainer.current.children as any as HTMLImageElement[]
      ).forEach((element) => {
        // set --gammaRotation and --betaRotation css properties
        element.style.setProperty("--gammaRotation", `${imagesRotation.gamma}`)
        element.style.setProperty("--betaRotation", `${imagesRotation.beta}`)
      })

      imagesRotation.beta *= 0.95
      if (Math.abs(imagesRotation.beta) < 0.001) imagesRotation.beta = 0
      imagesRotation.gamma *= 0.95
      if (Math.abs(imagesRotation.gamma) < 0.001) imagesRotation.gamma = 0
      window.requestAnimationFrame(frameHandler)
    }

    window.requestAnimationFrame(frameHandler)

    window.addEventListener("deviceorientation", handleOrientation)

    return () => {
      isActive = false
      window.removeEventListener("deviceorientation", handleOrientation)
    }
  }, [gifContainer])

  return (
    <div className="w-screen h-screen realtive flex items-center justify-center">
      <div ref={gifContainer} className="absolute inset-0 overflow-hidden">
        {gifs.map((gif, index) => (
          <div
            key={index}
            className="image-container"
            style={
              {
                "--left": gif.position.x,
                "--top": gif.position.y,
                "--z": gif.position.z,
                zIndex: Math.floor(gif.position.z * 100),
              } as any
            }
          >
            <img className="image" src={gif.src} alt="gif" />
          </div>
        ))}
      </div>
      <div className="relative z-[10000]">
        <h1>Te invito a mi cumple</h1>
        <button onClick={handleOrientationPermission}>Turn on the magic</button>
      </div>
    </div>
  )
}

export default App
