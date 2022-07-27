describe('Tests with backend', () => {

  beforeEach('login to the app', () => {
    // cy.server()
    // cy.route('GET', '**/tags', 'fixture:tags.json')      old method
    cy.intercept({method: 'Get', path: 'tags'}, {fixture: 'tags.json'})
    cy.loginToApplication()
  })

  it('verify correct request and response', () => {

    cy.intercept('POST', '**/articles').as('postArticles')
    let time = Date.now()

    cy.contains('New Article').click()
    cy.get('[formcontrolname="title"]').type(`This is a title ${time}`)
    cy.get('[formcontrolname="description"]').type(`This is a description ${time}`)
    cy.get('[formcontrolname="body"]').type(`This is a body of the Article ${time}`)
    cy.contains('Publish Article').click()

    cy.wait('@postArticles')
    cy.get('@postArticles').then( xhr => {
      console.log(xhr)
      expect(xhr?.response?.statusCode).to.equal(200)
      expect(xhr.request.body.article.body).to.equal(`This is a body of the Article ${time}`)
      expect(xhr.response.body.article.description).to.equal(`This is a description ${time}`)
    })
  })

  it('intercepting and modifying the request and response', () => {
    let time = Date.now()
    cy.intercept('POST', '**/articles', (req) => {                    //intercept request
      req.body.article.description = `This is a description ${time} modified`
    }).as('postArticles')

    cy.intercept('POST', '**/articles', (req) => {                    //intercept response to the server
      req.reply( res => {
        expect(res.body.article.description).to.equal(`This is a description ${time}`)
        res.body.article.description = "This is a description ${time} modified 2"
      })
    }).as('postArticles')

    cy.contains('New Article').click()
    cy.get('[formcontrolname="title"]').type(`This is a title ${time}`)
    cy.get('[formcontrolname="description"]').type(`This is a description ${time}`)
    cy.get('[formcontrolname="body"]').type(`This is a body of the Article ${time}`)
    cy.contains('Publish Article').click()

    cy.wait('@postArticles')
    cy.get('@postArticles').then( xhr => {
      console.log(xhr)
      expect(xhr?.response?.statusCode).to.equal(200)
      expect(xhr.request.body.article.body).to.equal(`This is a body of the Article ${time}`)
      expect(xhr.response.body.article.description).to.equal(`This is a description ${time} modified`)
    })
  })

  it('should gave tags with routing object', () => {
    cy.get('.tag-list')
      .should('contain', 'cypress')
      .and('contain', 'automation')
      .and('contain', 'testing')
  })

  it('verify global feed likes count', () => {

    cy.intercept('GET', '**/articles/feed*', {"articles":[],"articlesCount":0})
    cy.intercept('GET', '**/articles*', {fixture: 'articles.json'})

    cy.contains('Global Feed').click()
    cy.get('app-article-list button').then( listOfButtons => {
      expect(listOfButtons[0]).to.contain('1')
      expect(listOfButtons[1]).to.contain('5')
    })

    cy.fixture('articles').then( file => {
      const articleLink = file.articles[0].slug
      cy.intercept('POST', '**/articles/'+articleLink+'/favorite', file)
    })

    cy.get('app-article-list button').eq(0).click().should('contain', '2')

  })

  it.only('delete a new article', () => {

    const userCredentials = {
      "user": {
        "email": "660000@ukr.net",
        "password": "horek190689"
      }
    }

    const bodyRequest = {
      "article": {
        "tagList": [],
        "title": "Request from API",
        "description": "API testing is easy",
        "body": "Angular is cool"
      }
    }

    cy.request('POST', 'https://api.realworld.io/api/users/login', userCredentials)
      .its('body').then(body => {
      const token = body.user.token

      cy.request({
        url: 'https://conduit.productionready.io/api/articles/',
        headers: {'Authorization': 'Token ' + token},
        method: 'POST',
        body: bodyRequest
      }).then(response => {
        expect(response.status).to.equal(200)
      })
      cy.contains('Global Feed').click()
      cy.get('.article-preview').first().click()
      cy.get('.article-actions').contains('Delete Article').click()

      cy.request({
        url: 'https://conduit.productionready.io/api/articles?limit=10&offset=0',
        headers: {'Authorization': 'Token ' + token},
        method: 'GET'
      }).its('body').then(body => {
        expect(body.articles[0].title).not.to.equal('Request from API')
      })
    })
  })

})
