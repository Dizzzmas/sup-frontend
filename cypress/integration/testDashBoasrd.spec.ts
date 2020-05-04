import { NoticeFactory, IGetNoticesResponse } from "../fixtures/fixtureFactory/NoticeFactory"
import transportationOffer from "../../src/model/transportationOffer"
const NFactory: NoticeFactory = new NoticeFactory()
const getNoticesResponse: transportationOffer[] = NFactory.generateGetNoticesResponse()
const getSearchedOffers: transportationOffer[] = NFactory.generateEntries(4)

describe("test dashboard", () => {
  beforeEach(() => {
    cy.server()
    cy.route("GET", `**/api/transportation_offer?query=&*`, getNoticesResponse).as("getOffers")
    cy.visit("/dashboard")
  })

  it("test infinity scroll", () => {
    cy.wait("@getOffers")
    let numberOfChildren = 10

    for (let i = 0; i < 4; i++) {
      cy.dataCy("offers")
        .children()
        .then((children) => {
          cy.wrap(children).its("length").should("eq", numberOfChildren)
        })
      cy.dataCy("offers")
        .scrollTo("bottom", { duration: 2000 })
        .wait("@getOffers")
        .then(() => (numberOfChildren += 10))
    }
  })

  it("test search", () => {
    cy.wait("@getOffers")
    cy.route("GET", `**/api/transportation_offer**`, getSearchedOffers).as("getOffers")
    cy.dataCy("searchField").type("alg")
    cy.wait("@getOffers")
    cy.dataCy("offers")
      .children()
      .then((children) => {
        cy.wrap(children).its("length").should("eq", 4)
      })
  })

  it("test offer selection", () => {
    cy.wait("@getOffers")

    cy.dataCy("offers")
      .children()
      .then((children) => {
        for (let i = 0; i < children.length; i++) {
          cy.wrap(children[i]).click()
          cy.dataCy("selectedOfferTransferNumber").should("contain", getNoticesResponse[i].transferNumber)
          cy.dataCy("carrierName").should("contain", getNoticesResponse[i].transportationProvider.name)
          for (const additionalDetail of getNoticesResponse[i].transportationProvider.additional_details)
            cy.dataCy("additionalDetails").should("contain", additionalDetail)
          cy.dataCy("destination").should("contain", getNoticesResponse[i].destinationPoint)
        }
      })
  })
})
