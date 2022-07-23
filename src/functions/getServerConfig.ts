import { ref } from '..';
const configRef = ref.child("config");

/** Pre-existing config for a specified guild. */
export default function getServerConfig(guildId: string): Promise<string[] | null> {
    return new Promise((resolve) => {
        configRef.child(guildId).once("value", (val) => resolve(val.val()));
    })
}
