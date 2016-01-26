export function init () {
  describe('#add', function () {
    it('should inject relations', function () {
      const Test = this

      // can inject items without relations
      Test.UserCollection.add(Test.data.user1)
      Test.OrganizationCollection.add(Test.data.organization2)
      Test.CommentCollection.add(Test.data.comment3)
      Test.ProfileCollection.add(Test.data.profile4)

      Test.assert.deepEqual(Test.UserCollection.get(1).id, Test.data.user1.id)
      Test.assert.deepEqual(Test.OrganizationCollection.get(2).id, Test.data.organization2.id)
      Test.assert.deepEqual(Test.CommentCollection.get(3).id, Test.data.comment3.id)
      Test.assert.deepEqual(Test.ProfileCollection.get(4).id, Test.data.profile4.id)

      // can inject items with relations
      Test.UserCollection.add(Test.data.user10)
      Test.OrganizationCollection.add(Test.data.organization15)
      Test.CommentCollection.add(Test.data.comment19)
      Test.ProfileCollection.add(Test.data.profile21)
      Test.GroupCollection.add(Test.data.group1)

      // originals
      Test.assert.equal(Test.UserCollection.get(10).name, Test.data.user10.name)
      Test.assert.equal(Test.UserCollection.get(10).id, Test.data.user10.id)
      Test.assert.equal(Test.UserCollection.get(10).organizationId, Test.data.user10.organizationId)
      Test.assert.isArray(Test.UserCollection.get(10).comments)
      Test.assert.deepEqual(Test.OrganizationCollection.get(15).name, Test.data.organization15.name)
      Test.assert.deepEqual(Test.OrganizationCollection.get(15).id, Test.data.organization15.id)
      Test.assert.isArray(Test.OrganizationCollection.get(15).users)
      Test.assert.deepEqual(Test.CommentCollection.get(19).id, Test.data.comment19.id)
      Test.assert.deepEqual(Test.CommentCollection.get(19).content, Test.data.comment19.content)
      Test.assert.deepEqual(Test.ProfileCollection.get(21).id, Test.data.profile21.id)
      Test.assert.deepEqual(Test.ProfileCollection.get(21).content, Test.data.profile21.content)
      Test.assert.deepEqual(Test.GroupCollection.get(1).id, Test.data.group1.id)
      Test.assert.deepEqual(Test.GroupCollection.get(1).name, Test.data.group1.name)
      Test.assert.isArray(Test.GroupCollection.get(1).userIds)

      // user10 relations
      Test.assert.deepEqual(Test.CommentCollection.get(11), Test.UserCollection.get(10).comments[0])
      Test.assert.deepEqual(Test.CommentCollection.get(12), Test.UserCollection.get(10).comments[1])
      Test.assert.deepEqual(Test.CommentCollection.get(13), Test.UserCollection.get(10).comments[2])
      Test.assert.deepEqual(Test.OrganizationCollection.get(14), Test.UserCollection.get(10).organization)
      Test.assert.deepEqual(Test.ProfileCollection.get(15), Test.UserCollection.get(10).profile)
      // Doesn't work without relation links
      // Test.assert.isArray(Test.UserCollection.get(10).groups)
      // Test.assert.deepEqual(Test.UserCollection.get(10).groups[0], Test.GroupCollection.get(1))

      // group1 relations
      // Doesn't work without relation links
      // Test.assert.isArray(Test.GroupCollection.get(1).users)
      // Test.assert.deepEqual(Test.GroupCollection.get(1).users[0], Test.UserCollection.get(10))

      // organization15 relations
      Test.assert.deepEqual(Test.UserCollection.get(16), Test.OrganizationCollection.get(15).users[0])
      Test.assert.deepEqual(Test.UserCollection.get(17), Test.OrganizationCollection.get(15).users[1])
      Test.assert.deepEqual(Test.UserCollection.get(18), Test.OrganizationCollection.get(15).users[2])

      // comment19 relations
      Test.assert.deepEqual(Test.UserCollection.get(20), Test.CommentCollection.get(19).user)
      Test.assert.deepEqual(Test.UserCollection.get(19), Test.CommentCollection.get(19).approvedByUser)

      // profile21 relations
      Test.assert.deepEqual(Test.UserCollection.get(22), Test.ProfileCollection.get(21).user)
    })
    // Doesn't work without relation links
    // it('should find inverse links', function () {
    //   const Test = this
    //   Test.UserCollection.add({ organizationId: 5, id: 1 })
    //   Test.OrganizationCollection.add({ id: 5 })

    //   Test.assert.objectsEqual(Test.UserCollection.get(1).organization, { id: 5 })

    //   Test.assert.objectsEqual(Test.UserCollection.get(1).comments, [])
    //   Test.assert.objectsEqual(Test.UserCollection.get(1).approvedComments, [])

    //   Test.CommentCollection.add({ approvedBy: 1, id: 23 })

    //   Test.assert.equal(0, Test.UserCollection.get(1).comments.length)
    //   Test.assert.equal(1, Test.UserCollection.get(1).approvedComments.length)

    //   Test.CommentCollection.add({ approvedBy: 1, id: 44 })

    //   Test.assert.equal(0, Test.UserCollection.get(1).comments.length)
    //   Test.assert.equal(2, Test.UserCollection.get(1).approvedComments.length)
    // })
    it('should inject cyclic dependencies', function () {
      const Test = this
      const store = new Test.JSData.DataStore({
        linkRelations: true
      })
      store.defineMapper('foo', {
        relations: {
          hasMany: {
            foo: {
              localField: 'children',
              foreignKey: 'parentId'
            }
          }
        }
      })
      const injected = store.getCollection('foo').add([{
        id: 1,
        children: [
          {
            id: 2,
            parentId: 1,
            children: [
              {
                id: 4,
                parentId: 2
              },
              {
                id: 5,
                parentId: 2
              }
            ]
          },
          {
            id: 3,
            parentId: 1,
            children: [
              {
                id: 6,
                parentId: 3
              },
              {
                id: 7,
                parentId: 3
              }
            ]
          }
        ]
      }])

      Test.assert.equal(injected[0].id, 1)
      Test.assert.equal(injected[0].children[0].id, 2)
      Test.assert.equal(injected[0].children[1].id, 3)
      Test.assert.equal(injected[0].children[0].children[0].id, 4)
      Test.assert.equal(injected[0].children[0].children[1].id, 5)
      Test.assert.equal(injected[0].children[1].children[0].id, 6)
      Test.assert.equal(injected[0].children[1].children[1].id, 7)

      Test.assert.isDefined(store.getCollection('foo').get(1))
      Test.assert.isDefined(store.getCollection('foo').get(2))
      Test.assert.isDefined(store.getCollection('foo').get(3))
      Test.assert.isDefined(store.getCollection('foo').get(4))
      Test.assert.isDefined(store.getCollection('foo').get(5))
      Test.assert.isDefined(store.getCollection('foo').get(6))
      Test.assert.isDefined(store.getCollection('foo').get(7))
    })
    // Doesn't work without relation links
    // it('should work when injecting child relations multiple times', function () {
    //   const Test = this
    //   const store = new Test.JSData.DataStore({
    //     linkRelations: true
    //   })
    //   store.defineMapper('parent', {
    //     relations: {
    //       hasMany: {
    //         child: {
    //           localField: 'children',
    //           foreignKey: 'parentId'
    //         }
    //       }
    //     }
    //   })
    //   const Child = store.defineMapper('child', {
    //     relations: {
    //       belongsTo: {
    //         parent: {
    //           localField: 'parent',
    //           foreignKey: 'parentId'
    //         }
    //       }
    //     }
    //   })
    //   store.getCollection('parent').add({
    //     id: 1,
    //     name: 'parent1',
    //     children: [{
    //       id: 1,
    //       name: 'child1'
    //     }]
    //   })

    //   Test.assert.isTrue(store.getCollection('parent').get(1).children[0] instanceof Child.RecordClass)

    //   store.getCollection('parent').add({
    //     id: 1,
    //     name: 'parent',
    //     children: [
    //       {
    //         id: 1,
    //         name: 'Child-1'
    //       },
    //       {
    //         id: 2,
    //         name: 'Child-2'
    //       }
    //     ]
    //   })

    //   Test.assert.isTrue(store.getCollection('parent').get(1).children[0] instanceof Child.RecordClass)
    //   Test.assert.isTrue(store.getCollection('parent').get(1).children[1] instanceof Child.RecordClass)
    //   Test.assert.deepEqual(store.getCollection('child').filter({ parent_id: 1 }), store.getCollection('parent').get(1).children)
    // })
    // it.skip('should configure enumerability and linking of relations', function () {
    //   class Parent extends Test.JSData.Mapper {}
    //   Parent.configure({
    //     linkRelations: true
    //   })

    //   class Child extends Test.JSData.Mapper {}
    //   Child.configure({
    //     linkRelations: true
    //   })

    //   class OtherChild extends Test.JSData.Mapper {}
    //   OtherChild.configure({
    //     linkRelations: true
    //   })

    //   Parent.hasMany(Child, {
    //     localField: 'children'
    //   })
    //   Child.belongsTo(Parent, {
    //     link: false
    //   })
    //   OtherChild.belongsTo(Parent, {
    //     enumerable: true
    //   })

    //   const child = Child.inject({
    //     id: 1,
    //     parentId: 2,
    //     parent: {
    //       id: 2
    //     }
    //   })

    //   const otherChild = OtherChild.inject({
    //     id: 3,
    //     parentId: 4,
    //     parent: {
    //       id: 4
    //     }
    //   })

    //   Test.assert.isDefined(Child.get(child.id))
    //   Test.assert.isTrue(child.parent === Parent.get(child.parentId))

    //   Test.assert.isDefined(OtherChild.get(otherChild.id))
    //   Test.assert.isTrue(otherChild.parent === Parent.get(otherChild.parentId), 'parent was injected and linked')
    //   Test.assert.isDefined(Parent.get(otherChild.parentId), 'parent was injected and linked')

    //   let foundParent = false
    //   for (var k in otherChild) {
    //     if (k === 'parent' && otherChild[k] === otherChild.parent && otherChild[k] === Parent.get(otherChild.parentId)) {
    //       foundParent = true
    //     }
    //   }
    //   Test.assert.isTrue(foundParent, 'parent is enumerable')
    // })
    // it.skip('should not auto-inject relations where auto-injection has been disabled', function () {
    //   const Foo = Test.JSData.Mapper.extend(null, {
    //     name: 'foo'
    //   })
    //   const Bar = Test.JSData.Mapper.extend(null, {
    //     name: 'bar'
    //   })
    //   Foo.hasMany(Bar, {
    //     localField: 'bars',
    //     inject: false
    //   })
    //   Bar.belongsTo(Foo)
    //   const foo = Foo.inject({
    //     id: 1,
    //     bars: [
    //       {
    //         id: 1,
    //         fooId: 1
    //       },
    //       {
    //         id: 2,
    //         fooId: 1
    //       }
    //     ]
    //   })
    //   Test.assert.deepEqual(Bar.getAll(), [], 'nothing should have been injected')
    // })
    // it.skip('should allow custom relation injection logic', function () {
    //   const Foo = Test.JSData.Mapper.extend(null, {
    //     name: 'foo',
    //     linkRelations: true
    //   })
    //   const Bar = Test.JSData.Mapper.extend(null, {
    //     name: 'bar',
    //     linkRelations: true
    //   })
    //   Foo.hasMany(Bar, {
    //     localField: 'bars',
    //     foreignKey: 'fooId',
    //     inject: function (Foo, relationDef, foo) {
    //       const bars = relationDef.Relation.inject(foo.test_bars)
    //       for (var i = 0; i < bars.length; i++) {
    //         bars[i].beep = 'boop'
    //       }
    //       delete foo.test_bars
    //     }
    //   })
    //   Bar.belongsTo(Foo)
    //   const foo = Foo.inject({
    //     id: 1,
    //     test_bars: [
    //       {
    //         id: 1,
    //         fooId: 1
    //       },
    //       {
    //         id: 2,
    //         fooId: 1
    //       }
    //     ]
    //   })
    //   Test.assert.objectsEqual(foo.bars, [
    //     {
    //       id: 1,
    //       fooId: 1,
    //       beep: 'boop'
    //     },
    //     {
    //       id: 2,
    //       fooId: 1,
    //       beep: 'boop'
    //     }
    //   ], 'bars should have been injected')
    // })
    // it.skip('should not link relations nor delete field if "link" is false', function () {
    //   class Foo extends Test.JSData.Mapper {}
    //   Foo.configure({
    //     linkRelations: true
    //   })
    //   class Bar extends Test.JSData.Mapper {}
    //   Bar.configure({
    //     linkRelations: true
    //   })
    //   Foo.hasMany(Bar, {
    //     foreignKey: 'fooId',
    //     localField: 'bars',
    //     link: false
    //   })
    //   Bar.belongsTo(Foo, {
    //     localField: 'foo',
    //     foreignKey: 'fooId'
    //   })
    //   const foo = Foo.inject({
    //     id: 1,
    //     bars: [
    //       {
    //         id: 1,
    //         fooId: 1
    //       },
    //       {
    //         id: 2,
    //         fooId: 1
    //       }
    //     ]
    //   })
    //   Bar.inject({
    //     id: 3,
    //     fooId: 1
    //   })
    //   Test.assert.deepEqual(foo.bars, [
    //     {
    //       id: 1,
    //       fooId: 1
    //     },
    //     {
    //       id: 2,
    //       fooId: 1
    //     }
    //   ], 'bars should have been injected, but not linked')
    //   Test.assert.equal(Bar.getAll().length, 3, '3 bars should be in the store')
    // })
    it('should inject 1,000 items', function () {
      const Test = this
      let users = []
      for (var i = 0; i < 1000; i++) {
        users.push({
          id: i,
          name: 'john smith #' + i,
          age: Math.floor(Math.random() * 100),
          created: new Date().getTime(),
          updated: new Date().getTime()
        })
      }
      // const start = new Date().getTime()
      Test.UserCollection.add(users)
      // console.log('\tinject 1,000 users time taken: ', new Date().getTime() - start, 'ms')
    })
    // it('should inject 10,000 items', function () {
    //   const Test = this
    //   let users = []
    //   for (var i = 0; i < 10000; i++) {
    //     users.push({
    //       id: i,
    //       name: 'john smith #' + i,
    //       age: Math.floor(Math.random() * 100),
    //       created: new Date().getTime(),
    //       updated: new Date().getTime()
    //     })
    //   }
    //   const start = new Date().getTime()
    //   Test.UserCollection.add(users)
    //   console.log('\tinject 10,000 users time taken: ', new Date().getTime() - start, 'ms')
    // })
    it('should inject 1,000 items where there is an index on "age"', function () {
      const Test = this
      const collection = new Test.JSData.Collection({ mapper: new Test.JSData.Mapper({ name: 'user' }) })
      collection.createIndex('age')
      collection.createIndex('created')
      collection.createIndex('updated')
      let users = []
      for (var i = 0; i < 1000; i++) {
        users.push({
          id: i,
          name: 'john smith #' + i,
          age: Math.floor(Math.random() * 100),
          created: new Date().getTime(),
          updated: new Date().getTime()
        })
      }
      // const start = new Date().getTime()
      collection.add(users)
      // console.log('\tinject 1,000 users time taken: ', new Date().getTime() - start, 'ms')
    })
    // it.skip('should inject 10,000 items where there is an index on "age"', function () {
    //   class UserMapper extends Test.JSData.Mapper {}
    //   User.createIndex('age')
    //   User.createIndex('created')
    //   User.createIndex('updated')
    //   let users = []
    //   for (var i = 0; i < 10000; i++) {
    //     users.push({
    //       id: i,
    //       name: 'john smith #' + i,
    //       age: Math.floor(Math.random() * 100),
    //       created: new Date().getTime(),
    //       updated: new Date().getTime()
    //     })
    //   }
    //   const start = new Date().getTime()
    //   User.inject(users)
    //   // console.log('\tinject 10,000 users time taken: ', new Date().getTime() - start, 'ms')
    //   // console.log('\tusers age 40-44', User.between(40, 45, { index: 'age' }).length)
    // })
  })
}