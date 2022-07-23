describe('Tests with backend', () => {

  beforeEach('login to the app', () => {
    cy.server()
    cy.route('GET', '**/tags', 'fixture:tags.json')
    cy.loginToApplication()
  })

  it.skip('verify correct request and response', () => {

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

  it.skip('should gave tags with routing object', () => {
    cy.get('.tag-list')
      .should('contain', 'cypress')
      .and('contain', 'automation')
      .and('contain', 'testing')
  })

  it('verify global feed likes count', () => {

    cy.route('GET', '**/articles/feed*', '{"articles":[],"articlesCount":0}')
    cy.route('GET', '**/articles*', 'fixture:articles.json')

    cy.contains('Global Feed').click()
    cy.get('app-article-list button').then( listOfButtons => {
      expect(listOfButtons[0]).to.contain('1')
      expect(listOfButtons[1]).to.contain('5')
    })

    cy.fixture('articles').then( file => {
      const articleLink = file.articles[0].slug
      cy.route('POST', '**/articles/'+articleLink+'/favorite', file)
    })

    cy.get('app-article-list button').eq(0).click().should('contain', '2')

  })

})
