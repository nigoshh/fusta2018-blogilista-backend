const listHelper = require('../utils/list_helper')
const { formatBlog } = require('../utils/format')

const { initialBlogs } = require('./test_helper')
const _ids = ['5a422a851b54a676234d17f7', '5a422aa71b54a676234d17f8',
  '5a422b3a1b54a676234d17f9', '5a422b891b54a676234d17fa',
  '5a422ba71b54a676234d17fb', '5a422bc61b54a676234d17fc'
]
const blogs = initialBlogs
  .map((blog, i) => ({ ...blog, _id: _ids[i], __v: 0 }))

describe('favorite blog', () => {

  test('of empty list is undefined', () =>
    expect(listHelper.favoriteBlog([])).toBe(undefined)
  )

  test('when list has only one blog equals that blog', () =>
    expect(listHelper.favoriteBlog([blogs[3]])).toEqual(formatBlog(blogs[3]))
  )

  test('of a bigger list is the one with most likes', () =>
    expect(listHelper.favoriteBlog(blogs)).toEqual(formatBlog(blogs[2]))
  )
})

describe('most blogs', () => {

  test('of empty list is undefined', () =>
    expect(listHelper.mostBlogs([])).toBe(undefined)
  )

  test('when list has only one blog is that blog\'s author', () =>
    expect(listHelper.mostBlogs([blogs[5]]))
      .toEqual({
        author: 'Robert C. Martin',
        blogs: 1
      })
  )

  test('of a bigger list is the author with most blogs', () =>
    expect(listHelper.mostBlogs(blogs))
      .toEqual({
        author: 'Robert C. Martin',
        blogs: 3
      })
  )
})

describe('most likes', () => {

  test('of empty list is undefined', () =>
    expect(listHelper.mostLikes([])).toBe(undefined)
  )

  test('when list has only one blog is that blog\'s author', () =>
    expect(listHelper.mostLikes([blogs[0]]))
      .toEqual({
        author: 'Michael Chan',
        likes: 7
      })
  )

  test('of a bigger list is the author with most likes', () =>
    expect(listHelper.mostLikes(blogs))
      .toEqual({
        author: 'Edsger W. Dijkstra',
        likes: 17
      })
  )
})

describe('total likes', () => {

  test('of empty list is zero', () =>
    expect(listHelper.totalLikes([])).toBe(0)
  )

  test('when list has only one blog equals the likes of that', () =>
    expect(listHelper.totalLikes([blogs[0]])).toBe(7)
  )

  test('of a bigger list is calculated right', () =>
    expect(listHelper.totalLikes(blogs)).toBe(36)
  )
})

test('dummy is called', () => expect(listHelper.dummy([])).toBe(1))
