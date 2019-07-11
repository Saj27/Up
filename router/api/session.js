var SessionCtrl = require('../../controllers/SessionCtrl')

var User = require('../../models/User')

var ObjectId = require('mongodb').ObjectId

module.exports = function (router) {
  router.route('/session/new').post(function (req, res) {
    var data = req.body || {}
    var sessionType = data.sessionType
    var sessionSubTopic = data.sessionSubTopic
    var user = req.user

    SessionCtrl.create(
      {
        user: user,
        type: sessionType,
        subTopic: sessionSubTopic
      },
      function (err, session) {
        if (err) {
          res.json({
            err: err
          })
        } else {
          res.json({
            sessionId: session._id
          })
        }
      }
    )
  })
  function addSession (user, session) {
    User.update({ _id: user._id },
      { $addToSet: { pastSessions: session._id } },
      function (err, results) {
        if (err) {
          throw err
        } else {
          // print out what session was added to which user
          if (results.nModified === 1) {
            console.log(`${session._id} session was added to ` +
            `${user._id}'s pastSessions`)
          }
        }
      })
  }
  router.route('/session/end').post(function (req, res) {
    var data = req.body || {}
    var sessionId = data.sessionId
    SessionCtrl.get(
      {
        sessionId: sessionId
      },
      function (err, session) {
        if (err) {
          res.json({ err: err })
        } else if (!session) {
          res.json({ err: 'No session found' })
        } else {
          var student = session.student
          var volunteer = session.volunteer
          // add session to the student and volunteer's information
          addSession(student._id, session)
          if (volunteer) {
            addSession(volunteer._id, session)
          }
          session.endSession()
          res.json({ sessionId: session._id })
        }
      }
    )
  })

  router.route('/session/check').post(function (req, res) {
    var data = req.body || {}
    var sessionId = data.sessionId

    SessionCtrl.get(
      {
        sessionId: sessionId
      },
      function (err, session) {
        if (err) {
          res.json({
            err: err
          })
        } else if (!session) {
          res.json({
            err: 'No session found'
          })
        } else {
          res.json({
            sessionId: session._id,
            whiteboardUrl: session.whiteboardUrl
          })
        }
      }
    )
  })

  router.route('/session/current').post(function (req, res) {
    const data = req.body || {}
    const userId = data.user_id
    const isVolunteer = data.is_volunteer

    let studentId = null
    let volunteerId = null

    if (isVolunteer) {
      volunteerId = ObjectId(userId)
    } else {
      studentId = ObjectId(userId)
    }

    SessionCtrl.findLatest(
      {
        $and: [
          { endedAt: null },
          {
            $or: [{ student: studentId }, { volunteer: volunteerId }]
          }
        ]
      },
      function (err, session) {
        if (err) {
          res.json({ err: err })
        } else if (!session) {
          res.json({ err: 'No session found' })
        } else {
          res.json({
            sessionId: session._id,
            data: session
          })
        }
      }
    )
  })
}
