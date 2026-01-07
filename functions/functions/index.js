const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.notifyOnNewAnswer = functions.firestore
  .document("answers/{answerId}")
  .onCreate(async (snap, context) => {

    const answer = snap.data();

    const questionSnap = await admin.firestore()
      .doc(`questions/${answer.questionId}`)
      .get();

    const question = questionSnap.data();

    const tokenSnap = await admin.firestore()
      .doc(`notificationTokens/${question.askedById}`)
      .get();

    if (!tokenSnap.exists) return;

    const payload = {
      notification: {
        title: "New Answer Received",
        body: `Someone answered: "${question.content}"`
      }
    };

    await admin.messaging().sendToDevice(tokenSnap.data().token, payload);
  });
