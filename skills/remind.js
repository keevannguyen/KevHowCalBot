/*

Botkit Studio Skill module to enhance the "remind" script

*/


module.exports = function(controller) {
  
    controller.hears(['remind (.*)'],'direct_message, direct_mention, mention', function(bot, message) {
        
        console.log(message);
        var newtask = message.match[1];
        controller.storage.users.get(message.user, function(err, user) {

            if (!user) {
                user = {};
                user.id = message.user;
                user.tasks = [];
            }

            user.tasks.push(newtask);

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
