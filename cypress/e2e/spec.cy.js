describe("Homepage Navigation and Empty State", () => {
  it("should load the homepage and display navigation", () => {
    cy.visit("/");

    // Verify the main branding/header
    cy.contains("TTRPG Leveler").should("be.visible");

    // Verify navigation links are present
    cy.contains("Characters").should("be.visible");
    cy.contains("Profile").should("be.visible");
  });

  it("should display the correct empty state for new users", () => {
    // Stub the characters endpoint to return an empty array
    cy.intercept("GET", "**/api/characters", { body: [] }).as("getCharacters");

    cy.visit("/");

    // Wait for the API call to finish
    cy.wait("@getCharacters");

    // Verify the empty state messaging
    cy.contains("No Characters Found").should("be.visible");
    cy.contains("You don't have any characters yet.").should("be.visible");

    // Verify the primary call-to-action button exists
    cy.contains("+Create a Character").should("be.visible");
  });
});
