import Command from '../types/Command';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import validateUser from '../functions/validateUser';
import { PermissionFlagsBits } from 'discord-api-types/v9';

const dm: Command = {
	data: new SlashCommandBuilder()
		.setName('dm')
        .addStringOption(option =>
            option.setName("user")
                .setDescription("The user to message, ID or @.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("message")
                .setDescription("The message to send.")
                .setRequired(true)
        )
        // bot owner only can use this command
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription('Message the user as the bot.'),
	
	execute: async function (interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {

        // if user id not 232254618434797570, return
        // if (interaction.user.id !== "232254618434797570") {
        //     interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
        //     return;
        // }
        var user = interaction.options.getString("user", true);
        const message = interaction.options.getString("message", true);

        if (!interaction.guild) {return;}

        var isValidUser = await validateUser(user, interaction, true);
        if (!isValidUser) {
            return;
        }
        var {userGuildMember, userNamed, userID} = isValidUser;

        if (userGuildMember === null) {
            interaction.reply({ content: "You must specify a user to message.", ephemeral: true });
            return;
        }

        const serverName = interaction.guild.name;
        const serverIcon = interaction.guild.iconURL();

        // create embed
        const embed = new MessageEmbed()
            .setAuthor({ name: `${serverName}'s Administrators sent you a message:`, iconURL: `${serverIcon}` })
            .setDescription(message)
            .setFooter({ text: `Message content not endorsed by Meowd.`});

        // userGuildMember.user.send(message);
        userGuildMember.user.send({ embeds: [embed] });

        interaction.reply({ content: `Message sent to ${userGuildMember.user.tag}`, ephemeral: true });

    }
}

export default dm;