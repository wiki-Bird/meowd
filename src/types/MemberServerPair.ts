import { Guild, GuildMember } from "discord.js";

export default interface MemberServerPair {
    member: GuildMember;
    server: Guild;
}
