/// ULTRA PREMIUM HELP PANEL + DROPDOWN + ADVANCED TICKET UI

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

const ms = require("ms");

const client = new Client({ intents: Object.values(GatewayIntentBits) });

const PREFIX = "+";
const OWNER_ID = "1363540480662704248";

// ================= DATA SYSTEMS =================
const warns = new Map();
const eco = new Map();

function getUser(id) {
  if (!eco.has(id)) {
    eco.set(id, {
      cash: 0,
      bank: 0,
      lastDaily: 0,
      lastWeekly: 0
    });
  }
  return eco.get(id);
}

// ================= READY =================
client.on("ready", () => {
  console.log(`${client.user.tag} ONLINE`);
  client.user.setActivity("👑 Made By Huztro", { type: ActivityType.Playing });
});

// ================= HELP PANEL =================
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
        {
          label: "Moderation",
          value: "mod",
          emoji: "🔐"
        },
        {
          label: "Economy",
          value: "eco",
          emoji: "💰"
        },
        {
          label: "Invite Tracking System",
          value: "invite",
          emoji: "📧"
        },
        {
          label: "Giveaway System",
          value: "giveaway",
          emoji: "🎉"
        },
        {
          label: "AntiLink System",
          value: "antilink",
          emoji: "🔴"
        },
        {
          label: "Staff Apply Panel",
          value: "apply",
          emoji: "📨"
        }
      ])
  );
}

// ================= PREFIX CHECK =================
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  const args = msg.content.slice(PREFIX.length).trim().split(/ +/);
  const cmd = args.shift()?.toLowerCase();

  const isOwner = msg.author.id === OWNER_ID;
  if (!msg.content.startsWith(PREFIX) && !isOwner) return;

  // HELP
  if (cmd === "help") {
    msg.reply({ embeds: [helpPanel()], components: [helpDropdown()] });
  }

  // TICKET PANEL
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
          .setDescription("Click the button below to open a ticket.")
      ],
      components: [row]
    });
  }
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async (interaction) => {

  // DROPDOWN
  if (interaction.isStringSelectMenu()) {
    const value = interaction.values[0];

    if (value === "mod") {
      return interaction.reply({ content: "🔨 Ban, Kick, Warn, Mute, Lock, Purge...", ephemeral: true });
    }

    if (value === "eco") {
      return interaction.reply({ content: "💰 bal, daily, deposit, withdraw, rob...", ephemeral: true });
    }

    if (value === "invite") {
      return interaction.reply({ content: "📧 Invite tracking system active", ephemeral: true });
    }

    if (value === "giveaway") {
      return interaction.reply({ content: "🎉 Use +gstart time prize", ephemeral: true });
    }

    if (value === "antilink") {
      return interaction.reply({ content: "🔴 Blocks all links", ephemeral: true });
    }

    if (value === "apply") {
      return interaction.reply({ content: "📨 Use .apply to join staff", ephemeral: true });
    }
  }

  // BUTTONS
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

      return interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
    }

    if (interaction.customId === "close_ticket") {
      return interaction.channel.delete();
    }

    if (interaction.customId === "accept_app") {
      return interaction.reply({ content: "✅ Accepted", ephemeral: true });
    }

    if (interaction.customId === "deny_app") {
      return interaction.reply({ content: "❌ Denied", ephemeral: true });
    }
  }
});

// ================= MOD COMMANDS =================
client.on("messageCreate", async (msg) => {
  if (!msg.content.startsWith(PREFIX)) return;

  const args = msg.content.slice(PREFIX.length).split(/ +/);
  const cmd = args.shift()?.toLowerCase();

  if (cmd === "kick") {
    let user = msg.mentions.members.first();
    if (!user) return msg.reply("Mention user");
    user.kick();
    msg.reply("Kicked");
  }

  if (cmd === "ban") {
    let user = msg.mentions.members.first();
    if (!user) return msg.reply("Mention user");
    user.ban();
    msg.reply("Banned");
  }

  if (cmd === "unban") {
    let id = args[0];
    msg.guild.bans.remove(id);
    msg.reply("Unbanned");
  }

  if (cmd === "clear") {
    let amount = parseInt(args[0]);
    msg.channel.bulkDelete(amount);
  }

  if (cmd === "timeout") {
    let user = msg.mentions.members.first();
    let time = args[1];
    if (!user || !time) return;
    user.timeout(ms(time));
  }

  if (cmd === "removetimeout") {
    let user = msg.mentions.members.first();
    if (!user) return;
    user.timeout(null);
  }

  if (cmd === "warn") {
    let user = msg.mentions.users.first();
    let count = warns.get(user.id) || 0;
    warns.set(user.id, count + 1);
  }

  if (cmd === "unwarn") {
    let user = msg.mentions.users.first();
    let count = warns.get(user.id) || 0;
    warns.set(user.id, Math.max(0, count - 1));
  }

  if (cmd === "warnings") {
    let user = msg.mentions.users.first();
    msg.reply(`Warnings: ${warns.get(user.id) || 0}`);
  }

  if (cmd === "lock") {
    msg.channel.permissionOverwrites.edit(msg.guild.id, { SendMessages: false });
  }

  if (cmd === "unlock") {
    msg.channel.permissionOverwrites.edit(msg.guild.id, { SendMessages: true });
  }

  // ================= ECO =================
  if (cmd === "bal") {
    const user = getUser(msg.author.id);
    msg.reply(`Cash: ${user.cash} | Bank: ${user.bank}`);
  }

  if (cmd === "daily") {
    const user = getUser(msg.author.id);
    if (Date.now() - user.lastDaily < 86400000) return;
    user.cash += 1000;
    user.lastDaily = Date.now();
  }

  if (cmd === "weekly") {
    const now = Date.now();
    if (now - user.lastWeekly < 604800000)
      return msg.reply("⏳ You already claimed weekly!");

    const reward = Math.floor(Math.random() * 15000) + 5000;
    user.cash += reward;
    user.lastWeekly = now;

    return msg.reply(`📅 Weekly reward: ${reward}`);
  }

  if (cmd === "work") {
    const earn = Math.floor(Math.random() * 1000) + 200;
    user.cash += earn;
    return msg.reply(`💼 You worked and earned ${earn}`);
  }

    if (cmd === "fish") {
    const earn = Math.floor(Math.random() * 800);
    user.cash += earn;
    return msg.reply(`🎣 You caught fish worth ${earn}`);
  }

    if (cmd === "hunt") {
    const earn = Math.floor(Math.random() * 900);
    user.cash += earn;
    return msg.reply(`🏹 You hunted and earned ${earn}`);
  }

    if (cmd === "crime") {
    const earn = Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 2000);
    user.cash += earn;
    return msg.reply(`🕵️ Crime result: ${earn}`);
  }

    if (cmd === "pay") {
    const target = msg.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!target) return msg.reply("Mention user");
    if (!amount) return msg.reply("Enter amount");

    const receiver = getUser(target.id);

    if (user.cash < amount) return msg.reply("Not enough money");

    user.cash -= amount;
    receiver.cash += amount;

    return msg.reply(`💸 Sent ${amount} to ${target.tag}`);
  }

    if (cmd === "deposit") {
    const amount = parseInt(args[0]);
    if (!amount || user.cash < amount)
      return msg.reply("Invalid amount");

    user.cash -= amount;
    user.bank += amount;

    return msg.reply(`🏦 Deposited ${amount}`);
  }

    if (cmd === "withdraw") {
    const amount = parseInt(args[0]);
    if (!amount || user.bank < amount)
      return msg.reply("Invalid amount");

    user.bank -= amount;
    user.cash += amount;

    return msg.reply(`💵 Withdrawn ${amount}`);
  }

    if (cmd === "rob") {
    const target = msg.mentions.users.first();
    if (!target) return msg.reply("Mention user");

    const victim = getUser(target.id);

    if (victim.cash < 100) return msg.reply("Too poor to rob");

    const steal = Math.floor(Math.random() * victim.cash / 2);

    victim.cash -= steal;
    user.cash += steal;

    return msg.reply(`🪶 You robbed ${steal} from ${target.tag}`);
  }

  if (cmd === "rich") {
    const sorted = [...eco.entries()]
      .sort((a, b) => (b[1].cash + b[1].bank) - (a[1].cash + a[1].bank))
      .slice(0, 5);

    return msg.reply(
      "💎 Top Rich Users:\n" +
        sorted
          .map((u, i) => `${i + 1}. <@${u[0]}> - ${u[1].cash + u[1].bank}`)
          .join("\n")
    );
  }
});

client.login("YOUR_TOKEN_HERE");
