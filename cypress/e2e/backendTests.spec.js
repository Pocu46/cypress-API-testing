describe('Tests with backend', () => {

  beforeEach('login to the app', () => {
    cy.loginToApplication()
  })

  it('verify correct request and response', () => {

    cy.server()
    cy.route('POST', '**/articles').as('postArticles')
    let time = Date.now()

    cy.contains('New Article').click()
    cy.get('[formcontrolname="title"]').type(`This is a title ${time}`)
    cy.get('[formcontrolname="description"]').type(`This is a description ${time}`)
    cy.get('[formcontrolname="body"]').type(`This is a body of the Article ${time}`)
    cy.contains('Publish Article').click()

    cy.wait('@postArticles')
    cy.get('@postArticles').then( xhr => {
      console.log(xhr)
      expect(xhr.status).to.equal(200)
      expect(xhr.request.body.article.body).to.equal('This is a body of the Article'+' '+time)
      expect(xhr.response.body.article.description).to.equal('This is a description'+' '+time)
    })

  })
})
