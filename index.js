require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ChannelType
} = require("discord.js");
const ms = require("ms");

const client = new Client({
  intents: Object.values(GatewayIntentBits)
});

const prefix = "+";
const OWNER_ID = "1363540480662704248";
const WELCOME_CHANNEL_ID = "1500169317747261490";

// ===== DATABASE (TEMP MAPS) =====
let eco = new Map();
let warns = new Map();

// ===== READY =====
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [
      {
        name: "👑 Made By Huztro",
        type: 2 // 0 = Playing, 1 = Streaming, 2 = Listening, 3 = Watching
      }
    ],
    status: "online" // online, idle, dnd, invisible
  });
});
});

// ================= WELCOME SYSTEM =================
client.on("guildMemberAdd", async (member) => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("🎉 Welcome!")
    .setDescription(
      `👋 Welcome ${member} to **${member.guild.name}**!\n\n✨ Enjoy your stay\n💬 Be active\n🚀 Have fun`
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setColor("Random")
    .setFooter({ text: `Member #${member.guild.memberCount}` });

  channel.send({ content: `${member}`, embeds: [embed] });
});

// ===== MESSAGE HANDLER =====
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  const isOwner = msg.author.id === OWNER_ID;

  if (!msg.content.startsWith(prefix) && !isOwner) return;

  const args = msg.content.startsWith(prefix)
    ? msg.content.slice(prefix.length).trim().split(/ +/)
    : msg.content.trim().split(/ +/);

  const cmd = args.shift().toLowerCase();

  // ================= UI =================
  if (cmd === "avatar") {
    let user = msg.mentions.users.first() || msg.author;
    msg.reply(user.displayAvatarURL({ size: 1024 }));
  }

  if (cmd === "serveravatar") {
    msg.reply(msg.guild.iconURL({ size: 1024 }));
  }

  if (cmd === "roles") {
    let roles = msg.guild.roles.cache.map(r => r.name).join(", ");
    msg.reply(roles);
  }

  if (cmd === "memberinfo") {
    let user = msg.mentions.members.first() || msg.member;

    const embed = new EmbedBuilder()
      .setTitle("Member Info")
      .addFields(
        { name: "User", value: user.user.tag },
        { name: "ID", value: user.id },
        { name: "Joined", value: `${user.joinedAt}` }
      );

    msg.reply({ embeds: [embed] });
  }

  // ================= MOD =================
  if (cmd === "kick") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return msg.reply("No permission");
    let user = msg.mentions.members.first();
    if (!user) return msg.reply("Mention user");
    user.kick();
    msg.reply(`Kicked ${user.user.tag}`);
  }

  if (cmd === "ban") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return msg.reply("No permission");
    let user = msg.mentions.members.first();
    if (!user) return msg.reply("Mention user");
    user.ban();
    msg.reply(`Banned ${user.user.tag}`);
  }

  if (cmd === "unban") {
    let id = args[0];
    msg.guild.members.unban(id);
    msg.reply("Unbanned");
  }

  if (cmd === "clear") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return;
    let amount = parseInt(args[0]);
    msg.channel.bulkDelete(amount);
    msg.reply(`Deleted ${amount}`);
  }

  if (cmd === "timeout") {
    let user = msg.mentions.members.first();
    let time = args[1];
    user.timeout(ms(time));
    msg.reply("Timed out");
  }

  if (cmd === "removetimeout") {
    let user = msg.mentions.members.first();
    user.timeout(null);
    msg.reply("Timeout removed");
  }

  if (cmd === "warn") {
    let user = msg.mentions.users.first();
    let count = warns.get(user.id) || 0;
    warns.set(user.id, count + 1);
    msg.reply(`${user.tag} warned (${count + 1})`);
  }

  if (cmd === "unwarn") {
    let user = msg.mentions.users.first();
    let count = warns.get(user.id) || 0;
    warns.set(user.id, Math.max(0, count - 1));
    msg.reply("Warn removed");
  }

  if (cmd === "warnings") {
    let user = msg.mentions.users.first();
    msg.reply(`Warnings: ${warns.get(user.id) || 0}`);
  }

  if (cmd === "lock") {
    msg.channel.permissionOverwrites.edit(msg.guild.id, {
      SendMessages: false
    });
    msg.reply("Channel locked");
  }

  if (cmd === "unlock") {
    msg.channel.permissionOverwrites.edit(msg.guild.id, {
      SendMessages: true
    });
    msg.reply("Channel unlocked");
  }

  if (cmd === "slowmode") {
    let time = parseInt(args[0]);
    msg.channel.setRateLimitPerUser(time);
    msg.reply(`Slowmode ${time}s`);
  }

  // ================= ECONOMY =================
  if (cmd === "balance") {
    msg.reply(`💰 ${eco.get(msg.author.id) || 0}`);
  }

  if (cmd === "work") {
    let earn = Math.floor(Math.random() * 200);
    eco.set(msg.author.id, (eco.get(msg.author.id) || 0) + earn);
    msg.reply(`Earned ${earn}`);
  }

  if (cmd === "daily") {
    eco.set(msg.author.id, (eco.get(msg.author.id) || 0) + 500);
    msg.reply("Daily claimed");
  }

  if (cmd === "pay") {
    let user = msg.mentions.users.first();
    let amt = parseInt(args[1]);
    eco.set(msg.author.id, (eco.get(msg.author.id) || 0) - amt);
    eco.set(user.id, (eco.get(user.id) || 0) + amt);
    msg.reply("Paid");
  }

  if (cmd === "rob") {
    let user = msg.mentions.users.first();
    let amt = Math.floor(Math.random() * 300);
    eco.set(user.id, (eco.get(user.id) || 0) - amt);
    eco.set(msg.author.id, (eco.get(msg.author.id) || 0) + amt);
    msg.reply(`Robbed ${amt}`);
  }

  if (cmd === "leaderboard") {
    let top = [...eco.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((x, i) => `${i + 1}. <@${x[0]}> - ${x[1]}`)
      .join("\n");

    msg.reply(top);
  }

  // ================= ADMIN ECO =================
  if (cmd === "addmoney") {
    if (!isOwner) return;
    let user = msg.mentions.users.first();
    let amt = parseInt(args[1]);
    eco.set(user.id, (eco.get(user.id) || 0) + amt);
    msg.reply("Added");
  }

  if (cmd === "setmoney") {
    if (!isOwner) return;
    let user = msg.mentions.users.first();
    let amt = parseInt(args[1]);
    eco.set(user.id, amt);
    msg.reply("Set");
  }

  // ================= GIVEAWAY =================
  if (cmd === "gstart") {
    let time = args[0];
    let prize = args.slice(1).join(" ");

    if (!time || !prize) return msg.reply("Usage: gstart <time> <prize>");

    const embed = new EmbedBuilder()
      .setTitle("🎉 Giveaway")
      .setDescription(`Prize: **${prize}**\nReact with 🎉 to join!\nEnds in ${time}`)
      .setColor("Gold");

    let m = await msg.channel.send({ embeds: [embed] });
    await m.react("🎉");

    setTimeout(async () => {
      let users = await m.reactions.cache.get("🎉").users.fetch();
      let filtered = users.filter(u => !u.bot);
      let winner = filtered.random();
      msg.channel.send(`🎉 Winner: ${winner} | Prize: ${prize}`);
    }, ms(time));
  }

  // ================= TICKET PANEL =================
  if (cmd === "ticketpanel") {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket System")
      .setDescription("Select below — Ticket for?")
      .setColor("Blue");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_menu")
      .setPlaceholder("🎫 Ticket for?")
      .addOptions([
        { label: "Support", value: "support" },
        { label: "Report", value: "report" },
        { label: "Purchase", value: "purchase" }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    msg.channel.send({ embeds: [embed], components: [row] });
  }

  // ================= HELP PANEL =================
  if (cmd === "help") {
    const embed = new EmbedBuilder()
      .setTitle("✨ Help Panel")
      .setDescription("Select a category")
      .setColor("Blue");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("help_menu")
      .addOptions([
        { label: "Moderation", value: "mod" },
        { label: "Economy", value: "eco" },
        { label: "Info", value: "info" }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    msg.channel.send({ embeds: [embed], components: [row] });
  }
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === "ticket_menu") {
    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: ["ViewChannel"] },
        { id: interaction.user.id, allow: ["ViewChannel"] }
      ]
    });

    channel.send(`🎫 Ticket by ${interaction.user}`);
    interaction.reply({ content: "Ticket created!", ephemeral: true });
  }

  if (interaction.customId === "help_menu") {
    if (interaction.values[0] === "mod") {
      interaction.reply({ content: "kick, ban, unban, clear, warn, timeout...", ephemeral: true });
    }
    if (interaction.values[0] === "eco") {
      interaction.reply({ content: "balance, work, daily, pay, rob...", ephemeral: true });
    }
    if (interaction.values[0] === "info") {
      interaction.reply({ content: "avatar, serveravatar, roles, memberinfo", ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
