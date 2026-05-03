// ULTRA PREMIUM HELP PANEL + DROPDOWN + ADVANCED TICKET UI

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ActivityType,
  StringSelectMenuBuilder
} = require("discord.js");

const client = new Client({ intents: Object.values(GatewayIntentBits) });

const PREFIX = ".";
const OWNER_ID = "1363540480662704248";

// ================= READY =================
client.on("ready", () => {
  console.log(`${client.user.tag} ONLINE`);
  client.user.setActivity("👑 Made By Huztro", { type: ActivityType.Listing });
});

// ================= PREMIUM HELP PANEL =================
function helpPanel() {
  return new EmbedBuilder()
    .setColor("#0f172a")
    .setTitle("Namix Help Menu")
    .setDescription("Click dropdown below to explore commands <3\nType `.help [command]` for more info.")
    .addFields(
      { name: "🌐 Links", value: "[Website](#) • [Vote](#)\n[Support](#) • [Invite](#)" }
    )
    .setThumbnail("https://i.imgur.com/AfFp7pu.png")
    .setFooter({ text: "Thanks for choosing Namix" });
}

function helpDropdown() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("help_menu")
      .setPlaceholder("Choose a category...")
      .addOptions([
        { label: "Moderation", value: "ban, kick, unban, timeout, removetimeout, warn, unwarn, 
          warnings, lock, unlock slowmode, mute, unmute, nick, roleadd, roleremove, lock all, unlock all purge", emoji"🔐" },
        { label: "Economy", value: "daily, bal, bank, weekly, work, beg, crime, gamble, slot, fish, hunt, mine, deposit, withdraw,
          pay, rob, rich", emoji: "💰" },
        { label: "Invite Tracking System", value: "Invite Tracking System", emoji: "📧" }
        { label: "Giveaway System", value: "Giveaway System, Start Command: +gstart time prize", emoji: "🎉" }
        { label: "AntiLink System", value: "Blocks Every Links", emoji: "🔴" }
        { label: "Staff Apply Panel", value: "You Can Apply For Staff Here: <#channelid>", emoji: "📨" }
      ])
  );
}

// ================= COMMAND =================
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  const args = msg.content.slice(PREFIX.length).trim().split(/ +/);
  const cmd = args.shift()?.toLowerCase();

  const isOwner = msg.author.id === OWNER_ID;
  if (!msg.content.startsWith(PREFIX) && !isOwner) return;

  if (cmd === "help") {
    msg.reply({ embeds: [helpPanel()], components: [helpDropdown()] });
  }

  if (cmd === "ticket") {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("open_ticket")
        .setLabel("🎟 Open Ticket")
        .setStyle(ButtonStyle.Success)
    );

    msg.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#111827")
          .setTitle("Namix Support System")
          .setDescription("Click the button below to open a ticket with our support team.\nWe will assist you as quickly as possible.")
          .setThumbnail("https://i.imgur.com/AfFp7pu.png")
      ],
      components: [row]
    });
  }
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async (interaction) => {
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "help_menu") {
      const value = interaction.values[0];

      if (value === "mod") {
        interaction.reply({ content: "🔨 Ban, Kick, Warn, Mute, Lock, Purge...", ephemeral: true });
      }

      if (value === "eco") {
        interaction.reply({ content: "💰 bal, daily, deposit, withdraw, rob...", ephemeral: true });
      }

      if (value === "ticket") {
        interaction.reply({ content: "🎫 Use ticket panel to create support tickets", ephemeral: true });
      }
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === "open_ticket") {
      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: ["ViewChannel"] },
          { id: interaction.user.id, allow: ["ViewChannel"] }
        ]
      });

      const closeRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("🔒 Close Ticket")
          .setStyle(ButtonStyle.Danger)
      );

      channel.send({
        content: `${interaction.user}`,
        embeds: [
          new EmbedBuilder()
            .setTitle("Support Ticket")
            .setDescription("Support will be with you shortly.")
        ],
        components: [closeRow]
      });

      interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
    }

    if (interaction.customId === "close_ticket") {
      interaction.channel.delete();
    }
  }
});

// ================= EXTRA PREMIUM SYSTEMS (ADDED WITHOUT REMOVING ANYTHING) =================
const ms = require("ms");

// ================= ADVANCED MOD COMMANDS =================
client.on("messageCreate", async (msg) => {
  if (!msg.content.startsWith(PREFIX)) return;
  const args = msg.content.slice(PREFIX.length).split(/ +/);
  const cmd = args.shift()?.toLowerCase();

  if (cmd === "kick") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return msg.reply("No permission");
    let user = msg.mentions.members.first();
    if (!user) return msg.reply("Mention user");
    user.kick();
    msg.reply(`Kicked ${user.user.tag}`);
  }

  if (cmd === "ban") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return msg.reply("No permission");
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
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
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
    msg.channel.permissionOverwrites.edit(msg.guild.id, { SendMessages: false });
    msg.reply("Channel locked");
  }

  if (cmd === "unlock") {
    msg.channel.permissionOverwrites.edit(msg.guild.id, { SendMessages: true });
    msg.reply("Channel unlocked");
  }

  if (cmd === "serverinfo") {
  const guild = msg.guild;

  const embed = new EmbedBuilder()
    .setColor("#6366f1")
    .setTitle("🏠 Server Info")
    .setThumbnail(guild.iconURL())
    .addFields(
      { name: "Name", value: guild.name, inline: true },
      { name: "ID", value: guild.id, inline: true },
      { name: "Owner", value: `<@${guild.ownerId}>`, inline: true },
      { name: "Members", value: `${guild.memberCount}`, inline: true },
      { name: "Roles", value: `${guild.roles.cache.size}`, inline: true },
      { name: "Channels", value: `${guild.channels.cache.size}`, inline: true },
      { name: "Created", value: `<t:${parseInt(guild.createdTimestamp/1000)}:R>` }
    );

  msg.reply({ embeds: [embed] });
}

  if (cmd === "userinfo") {
  let user = msg.mentions.users.first() || msg.author;
  let member = msg.guild.members.cache.get(user.id);

  const embed = new EmbedBuilder()
    .setColor("#3b82f6")
    .setTitle("👤 User Info")
    .setThumbnail(user.displayAvatarURL())
    .addFields(
      { name: "Username", value: user.tag, inline: true },
      { name: "ID", value: user.id, inline: true },
      { name: "Joined Server", value: `<t:${parseInt(member.joinedTimestamp/1000)}:R>`, inline: true },
      { name: "Account Created", value: `<t:${parseInt(user.createdTimestamp/1000)}:R>`, inline: true },
      { name: "Roles", value: member.roles.cache.map(r => r).join(", ").slice(0, 1000) || "None" }
    );

  msg.reply({ embeds: [embed] });
}

  if (cmd === "roles") {
  const roles = msg.guild.roles.cache
    .filter(r => r.id !== msg.guild.id)
    .map(r => r)
    .join(", ")
    .slice(0, 2000);

  msg.reply(`🎭 Roles:\n${roles}`);
}

  if (cmd === "roleinfo") {
  let role = msg.mentions.roles.first();
  if (!role) return msg.reply("Mention a role");

  const embed = new EmbedBuilder()
    .setColor(role.color || "#ffffff")
    .setTitle("🎯 Role Info")
    .addFields(
      { name: "Name", value: role.name, inline: true },
      { name: "ID", value: role.id, inline: true },
      { name: "Members", value: `${role.members.size}`, inline: true },
      { name: "Color", value: `${role.hexColor}`, inline: true },
      { name: "Created", value: `<t:${parseInt(role.createdTimestamp/1000)}:R>` }
    );

  msg.reply({ embeds: [embed] });
}
  
  if (cmd === "slowmode") {
    let time = parseInt(args[0]);
    msg.channel.setRateLimitPerUser(time);
    msg.reply(`Slowmode ${time}s`);
  }

  // ================= EXTRA ECO =================
  if (cmd === "fish") {
    const user = getUser(msg.author.id);
    const earn = Math.floor(Math.random()*800);
    user.cash += earn;
    msg.reply(`🎣 You caught ${earn}`);
  }

  if (cmd === "work") {
    const user = getUser(msg.author.id);
    const earn = Math.floor(Math.random()*1000)+200;
    user.cash += earn;
    msg.reply(`💼 Earned ${earn}`);
  }

  if (cmd === "crime") {
    const user = getUser(msg.author.id);
    const earn = Math.random() < 0.5 ? 0 : Math.floor(Math.random()*2000);
    user.cash += earn;
    msg.reply(`🕵️ Result: ${earn}`);
  }

  if (cmd === "pay") {
    const target = msg.mentions.users.first();
    const amt = parseInt(args[1]);
    const user = getUser(msg.author.id);
    const rec = getUser(target.id);

    if (!target || !amt) return msg.reply("Usage: pay @user amount");
    if (user.cash < amt) return msg.reply("Not enough");

    user.cash -= amt;
    rec.cash += amt;
    msg.reply(`💸 Paid ${amt} to ${target.tag}`);
  }

   if (cmd === "daily") {
    const user = getUser(msg.author.id);
    const now = Date.now();
    if (now - user.lastDaily < 86400000) return msg.reply("⏳ Already claimed");

    const reward = Math.floor(Math.random()*5000)+1000;
    user.cash += reward;
    user.lastDaily = now;
    msg.reply(`🎁 Daily: ${reward}`);
  }

   if (cmd === "weekly") {
    const user = getUser(msg.author.id);
    const now = Date.now();
    if (!user.lastWeekly) user.lastWeekly = 0;
    if (now - user.lastWeekly < 604800000) return msg.reply("⏳ Already claimed");

    const reward = Math.floor(Math.random()*10000)+3000;
    user.cash += reward;
    user.lastWeekly = now;
    msg.reply(`📅 Weekly: ${reward}`);
  }
  
  if (cmd === "hunt") {
    const user = getUser(msg.author.id);
    const earn = Math.floor(Math.random()*900);
    user.cash += earn;
    msg.reply(`🏹 You earned ${earn}`);
  }

   if (cmd === "bank") {
    const user = getUser(msg.author.id);
    msg.reply(`🏦 Bank: ${user.bank}`);
  }

  if (cmd === "rich") {
    const sorted = [...eco.entries()].sort((a,b)=>b[1].cash-a[1].cash).slice(0,5);
    msg.reply("💎 Top Users:
" + sorted.map((u,i)=>`${i+1}. <@${u[0]}> - ${u[1].cash}`).join("
"));
  }

  if (cmd === "bal") {
  const user = getUser(msg.author.id);

  const total = user.cash + user.bank;

  const embed = new EmbedBuilder()
    .setColor("#22c55e")
    .setTitle("💰 Balance")
    .setThumbnail(msg.author.displayAvatarURL())
    .addFields(
      { name: "💵 Cash", value: `${user.cash}`, inline: true },
      { name: "🏦 Bank", value: `${user.bank}`, inline: true },
      { name: "📊 Total", value: `${total}`, inline: true }
    )
    .setFooter({ text: `User: ${msg.author.tag}` });

  msg.reply({ embeds: [embed] });
}
  
  if (cmd === "gamble") {
    const user = getUser(msg.author.id);
    const bet = parseInt(args[0]);
    if (user.cash < bet) return msg.reply("Not enough money");
    if (Math.random() < 0.5) {
      user.cash += bet;
      msg.reply(`🎰 Won ${bet}`);
    } else {
      user.cash -= bet;
      msg.reply(`❌ Lost ${bet}`);
    }
  }
});

// ================= STAFF APPLICATION SYSTEM =================
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (msg.content === ".apply") {
    msg.reply("Check your DMs for application");

    const questions = [
      "Why do you want to be staff?",
      "Your age?",
      "Experience?",
      "How active are you?",
      "Why should we choose you?"
    ];

    const answers = [];
    const dm = await msg.author.createDM();

    for (let q of questions) {
      await dm.send(q);
      const collected = await dm.awaitMessages({ max: 1, time: 60000 });
      answers.push(collected.first()?.content || "No answer");
    }

    const channel = client.channels.cache.get("1500169350307647488");

    const embed = new EmbedBuilder()
      .setTitle("📋 New Staff Application")
      .setDescription(answers.map((a,i)=>`Q${i+1}: ${a}`).join("

"))
      .setFooter({ text: msg.author.tag });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("accept_app").setLabel("✅ Accept").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("deny_app").setLabel("❌ Deny").setStyle(ButtonStyle.Danger)
    );

    channel.send({ embeds: [embed], components: [row] });
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "accept_app") {
    interaction.reply({ content: "✅ Application Accepted", ephemeral: true });
  }

  if (interaction.customId === "deny_app") {
    interaction.reply({ content: "❌ Application Denied", ephemeral: true });
  }
});

client.login("YOUR_TOKEN_HERE");
