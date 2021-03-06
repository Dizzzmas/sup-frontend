import * as React from "react"
import { Box, CircularProgress } from "@material-ui/core"
import useStyles from "./Styles/boardStyles"
import BoardNotice from "./BoardNotice"
import ITransportationOffer from "model/transportationOffer"
import { DashboardContext } from "service/dashboardContext/dashboardContext"
import { getTransportationOffers } from "service/api/transportationOffer"

interface IBoardProps {
  transportationOffers: ITransportationOffer[]
  setTransportationOffers: React.Dispatch<React.SetStateAction<ITransportationOffer[]>>
}

const Board = ({ transportationOffers, setTransportationOffers }: IBoardProps) => {
  const dashboardContext = React.useContext(DashboardContext)
  const [page, setPage] = React.useState(1)
  const [scrolledBottom, setScrolledBottom] = React.useState(true)
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false)

  React.useEffect(() => {
    const processedNewOffers = async (): Promise<void> => {
      await setScrolledBottom(false)
      const newNotices = await getTransportationOffers(page, 10, dashboardContext.query)
      if (newNotices[0] && transportationOffers.length === 0)
        dashboardContext.handleSettingOffer({ transportationOffer: newNotices[0] })
      await setTransportationOffers((notices) => [...notices, ...newNotices])
      setIsLoaded(true)
    }

    if (scrolledBottom) {
      processedNewOffers()
    }
  }, [dashboardContext, transportationOffers.length, page, scrolledBottom, setTransportationOffers])

  // Ask about type assertion
  async function onScrollHandler() {
    const noticesContainer: null | HTMLElement = document.getElementById("transportationOffers-container")
    if (noticesContainer) {
      const onScrollHeight: number =
        noticesContainer.scrollHeight - noticesContainer.scrollTop - noticesContainer.clientHeight
      if (onScrollHeight < 1) {
        setIsLoaded(false)
        setPage(page + 1)
        setScrolledBottom(true)
      }
    }
  }

  const classes = useStyles()
  return (
    <>
      <Box
        id={"transportationOffers-container"}
        data-cy={"offers"}
        onScroll={onScrollHandler}
        className={classes.dashboard}
      >
        {transportationOffers.map((transportationOffer: ITransportationOffer, index: number) => {
          return <BoardNotice isSelectable={true} transportationOffer={transportationOffer} key={index} />
        })}
      </Box>
      {!isLoaded && dashboardContext.transportationOffer.id !== "null" && (
        <CircularProgress className={classes.loader} size={60} color={"primary"} />
      )}
    </>
  )
}

export default Board
