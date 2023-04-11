import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js';
import getUserConfig from '../functions/getUserConfig';
import Command from '../types/Command';
import { ref } from '..';
import validateUser from '../functions/validateUser';
import { createCanvas, loadImage } from 'canvas';

const imgedit: Command = {
	data: new SlashCommandBuilder()
		.setName('imgedit')
        .addStringOption(option =>
            option.setName("action")
                .setDescription("The action to do.")
                .setRequired(true)
                .addChoices(
                    { name: "Speech Bubble", value: "speechbubble" },
                    { name: "Rainbow", value: "rainbow" },
                    { name: "Jerma", value: "jerma" },
                    { name: "Invert", value: "invert" },
                )
        )
        .addStringOption(option =>
            option.setName("user")
                .setDescription("The user to do stuff with.")
                .setRequired(false)
        )
        .addAttachmentOption(option =>
            option.setName("attachment")
                .setDescription("The image to do stuff with.")
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName("text")
                .setDescription("Text on image call that imgtext")
                .setRequired(false)
        )
		.setDescription('Do fun stuff with images.'),
	
    execute: async function (interaction): Promise<void> {
        var action = interaction.options.getString("action", true);
        var user = interaction.options.getString("user", false);
        var attachment = interaction.options.getAttachment("attachment", false);
        var text = interaction.options.getString("text", false);
        var image;

        if (!interaction.guild) {return;}

        if (!user && !attachment) {
            // image is the author's avatar
            image = interaction.user.displayAvatarURL({ format: "png", size: 1024 });
        }
        else if (user && !attachment) {
            var isValidUser = await validateUser(user, interaction, true);
            if (!isValidUser) {
                return;
            }
            var {userGuildMember, userNamed, userID} = isValidUser;

            image = userGuildMember.user.displayAvatarURL({ format: "png", size: 1024 });
        }
        else if (!user && attachment) {
            image = attachment.url;
        }
        else {
            interaction.reply({ content: "You can't specify both a user and an attachment.", ephemeral: true });
            return;
        }

        var canvas = createCanvas(1024, 1024);
        var ctx = canvas.getContext('2d');

        // set background to clear
        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // load image
        var img = await loadImage(image);
        ctx.drawImage(img, 0, 0, 1024, 1024);

        // if action is speechbubble
        if (action === "speechbubble") {
            // draw speech bubble on top
            ctx.fillStyle = "rgba(50, 51, 56, 1)";
            
            // speech bubble main bubble:
            ctx.beginPath();
            ctx.arc(512, -820, 1024, 0, Math.PI * 2, true); // xcoord, ycoord, radius, ?, ?, ?
            ctx.fill();
            ctx.closePath();

            // speech bubble speaking arrow:
            ctx.beginPath();
            // triangle that starts at x=700 y=80 and goes to x=750 y=100 and x=750 y=60
            ctx.moveTo(700, 250);
            ctx.lineTo(790, 100);
            ctx.lineTo(680, 100);
            ctx.fill();
            ctx.closePath();
        }
        else if (action === "rainbow") {
            // draw pride circle around image
            var pride = await loadImage("https://cdn.discordapp.com/attachments/669394205705240606/1095209363452469349/pride2.png");
            ctx.drawImage(pride, 0, 0, 1024, 1024);
        }
        else if (action === "jerma") {
            var jerma = await loadImage("https://cdn.discordapp.com/attachments/669394205705240606/1095204244447043615/jerma.png");
            ctx.drawImage(jerma, 0, 124, 900, 900);
        }
        else if (action === "invert") {
            var imgData = ctx.getImageData(0, 0, 1024, 1024);
            var data = imgData.data;

            for (var i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];     // red
                data[i + 1] = 255 - data[i + 1]; // green
                data[i + 2] = 255 - data[i + 2]; // blue
            }

            ctx.putImageData(imgData, 0, 0);
        }

        if (text) {
            ctx.font = "bold 80px Arial";
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.textAlign = "center";
            ctx.fillText(text, 512, 950);
            ctx.strokeText(text, 512, 950);
        }



        const imgAttachment = new MessageAttachment(canvas.toBuffer(), 'image.png');

        // return image in embed
        var embed = new MessageEmbed()
            .setTitle(`Image Edit: ${action}`)
            .setImage("attachment://image.png")
            .setColor("#00f2ff")
            .setTimestamp();

        // send embed
        interaction.reply({ embeds: [embed], files: [imgAttachment] });
        
    }
}

export default imgedit;