import { ref } from '..';
const configRef = ref.child("config");

/** Pre-existing config for a specified guild. */
export default function getUserConfig(userId: string, guildId: string): Promise<string[] | null> {
    return new Promise((resolve) => {
        configRef.child(guildId).child(userId).once("value", (val) => resolve(val.val()));
    })
}
