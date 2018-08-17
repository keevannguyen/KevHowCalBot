/*

Botkit Studio Skill module to enhance the "remind" script

*/

const fs = require('fs');
const { google } = require('googleapis');

module.exports = function(controller) {
  
    controller.hears(['remind (.*)'],'direct_message, direct_mention, mention', function(bot, message) {
        
        var newtask = message.match[1];
        controller.storage.users.get(message.user, (err, user) => {

            if (!user) {
                user = {};
                user.id = message.user;
                user.reminders = [];
                user.oAuth2Client = null;
                user.token = null;
            }
              
            if (!user.oAuth2Client) {
              fs.readFile('./GoogleCalCredentials.json', (err, content) => {
                if (err) return console.log('Error loading client secret file:', err);
                return getToken(JSON.parse(content));
              });

              function getToken(credentials) {
                const {client_secret, client_id, redirect_uris} = credentials.web;
                user.oAuth2Client = new google.auth.OAuth2(
                    client_id, client_secret, 'https://sage-orchid.glitch.me/hello_world');
                console.log(user);
                const authUrl = user.oAuth2Client.generateAuthUrl({
                  access_type: 'offline',
                  scope: 'https://www.googleapis.com/auth/calendar',
                  state: message.user
                });
                
                // Bot Sends OAuth Link
                bot.reply(message, {
                    attachments:[
                        {
                            title: 'You need to authorize Google Calendar for this application',
                            callback_id: '123',
                            attachment_type: 'default',
                            "color": "#3AA3E3",
                            actions: [
                                {
                                    "name": "gCal",
                                    "text": "Authorize",
                                    "type": "button",
                                    "value": null,
                                    "url": authUrl
                                }
                            ]
                        }
                    ]
                });
              }
            }
          
            bot.reply(message, 'Your User Token: ' + user.token );

            user.reminders.push(newtask);
            
            controller.storage.users.save(user, function(err,saved) {

                if (err) {
                    bot.reply(message, 'I experienced an error adding your task: ' + err);
                } else {
                    bot.api.reactions.add({
                        name: 'thumbsup',
                        channel: message.channel,
                        timestamp: message.ts
                    });
                    bot.reply(message, 'I have added your task!');
                }

            });
        });

    });
  
}
