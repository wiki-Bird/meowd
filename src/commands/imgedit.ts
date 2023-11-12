import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import Command from '../types/Command';
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
                    { name: "1984", value: "1984" },
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
        await interaction.deferReply();

        const action = interaction.options.getString("action", true);
        const user = interaction.options.getString("user", false);
        const attachment = interaction.options.getAttachment("attachment", false);
        const text = interaction.options.getString("text", false);
        
        let image;


        if (!interaction.guild) {return;}

        if (!user && !attachment) {
            // image is the author's avatar
            image = interaction.user.displayAvatarURL({ format: "png", size: 1024 });
        }
        else if (user && !attachment) {
            const isValidUser = await validateUser(user, interaction, true);
            if (!isValidUser) {
                return;
            }
            const {userGuildMember} = isValidUser;

            image = userGuildMember.user.displayAvatarURL({ format: "png", size: 1024 });
        }
        else if (!user && attachment) {
            // if attachment is not an image, return
            console.log(attachment.contentType)
            // if (!attachment.url.endsWith(".png") && !attachment.url.endsWith(".jpg") && !attachment.url.endsWith(".jpeg") && !attachment.url.endsWith(".gif")) {
            if (!attachment.contentType!.startsWith("image/")) {
                interaction.editReply({ content: "You must upload an image." });
                return;
            }
            image = attachment.url;
        }
        else {
            interaction.editReply({ content: "You can't specify both a user and an attachment." });
            return;
        }

        const canvas = createCanvas(1024, 1024);
        const ctx = canvas.getContext('2d');

        // set background to clear
        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // load image
        const img = await loadImage(image);
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
            const pride = await loadImage("https://cdn.discordapp.com/attachments/669394205705240606/1095209363452469349/pride2.png");
            ctx.drawImage(pride, 0, 0, 1024, 1024);
        }
        else if (action === "jerma") {
            const jerma = await loadImage("https://cdn.discordapp.com/attachments/669394205705240606/1095204244447043615/jerma.png");
            ctx.drawImage(jerma, 0, 124, 900, 900);
        }
        else if (action === "invert") {
            const imgData = ctx.getImageData(0, 0, 1024, 1024);
            const data = imgData.data;

            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];     // red
                data[i + 1] = 255 - data[i + 1]; // green
                data[i + 2] = 255 - data[i + 2]; // blue
            }

            ctx.putImageData(imgData, 0, 0);
        }
        else if (action === "1984") {
            // set background to https://i.imgur.com/ezs1Gf0.png
            ctx.drawImage(img, 20, 0, 1000, 800);
            // drag https://i.imgur.com/00mhtBU.png over it
            const img2 = await loadImage("https://i.imgur.com/00mhtBU.png");
            ctx.drawImage(img2, 0, 0, 1024, 1024);
        }


            // draw "img" on top, from  



        if (text) {
            ctx.font = "bold 80px Arial";
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.textAlign = "center";

            let y = 90;
            const x = 512;

            const textWidth = ctx.measureText(text).width;
            if (textWidth > canvas.width - 20) {
                const maxWidth = canvas.width - 20;
                // Split the text into multiple lines
                const words = text.split(' ');
                let line = '';
                const lines = [];

                for (let i = 0; i < words.length; i++) {
                    const testLine = line + words[i] + ' ';
                    const testWidth = ctx.measureText(testLine).width;
                    if (testWidth > maxWidth) {
                    lines.push(line);
                    line = words[i] + ' ';
                    } else {
                    line = testLine;
                    }
                }
                lines.push(line);

                // Draw each line of text
                
                for (let i = 0; i < lines.length; i++) {
                    ctx.fillText(lines[i], x, y);
                    ctx.strokeText(lines[i], x, y);
                    y += 60;
                }
                
            } else {
                // Draw the text normally
                ctx.fillText(text, x, y);
                ctx.strokeText(text, x, y);
            }

            // ctx.fillText(text, 512, 90);
            // ctx.strokeText(text, 512, 90);
        }

        const imgAttachment = new MessageAttachment(canvas.toBuffer(), 'image.png');

        // return image in embed
        const embed = new MessageEmbed()
            .setTitle(`Image Edit: ${action}`)
            .setImage("attachment://image.png")
            .setColor("#00f2ff")
            .setTimestamp();

        // send embed
        await interaction.editReply({ embeds: [embed], files: [imgAttachment] });
        
    }
}

export default imgedit;