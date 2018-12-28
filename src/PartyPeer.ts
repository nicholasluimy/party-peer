import { FirebaseFirestore } from "@firebase/firestore-types";
import Utils from "./Utils";

export default class PartyPeer {
    public readonly PARTY_COLLECTION_ID = "parties";
    public readonly PEER_COLLECTION_ID = "peers";
    public readonly IS_INITIATOR: boolean;

    private firestore: FirebaseFirestore;

    constructor(firestore: FirebaseFirestore, isInitiator = false) {
        this.firestore = firestore;
        this.IS_INITIATOR = isInitiator;
    }

    public create(passcode = Utils.generateRandomSixDigits()) {
        return this.db(this.PARTY_COLLECTION_ID)
            .doc(passcode)
            .set({
                createTime: Date.now(),
            });
    }

    public async party(passcode: string) {
        return this.db(this.PARTY_COLLECTION_ID)
            .doc(passcode)
            .get();
    }

    public isPartyExists(passcode: string) {
        return this.party(passcode)
            .then((d) => d.exists)
            .catch(() => false);
    }

    public async join(passcode: string, joiner: string) {
        if (!(await this.isPartyExists(passcode))) {
            throw new Error(`Invalid passcode '${passcode}'.`);
        }

        return this.db(
            `${this.PARTY_COLLECTION_ID}/${passcode}/${this.PEER_COLLECTION_ID}`,
        )
            .doc(joiner)
            .set({
                createTime: Date.now(),
            });
    }

    public async peers(passcode: string) {
        if (!(await this.isPartyExists(passcode))) {
            throw new Error(`Invalid passcode '${passcode}'.`);
        }

        return this.db(
            `${this.PARTY_COLLECTION_ID}/${passcode}/${this.PEER_COLLECTION_ID}`,
        ).get();
    }

    public peer(passcode: string, joiner: string) {
        return this.db(
            `${this.PARTY_COLLECTION_ID}/${passcode}/${this.PEER_COLLECTION_ID}`,
        )
            .doc(joiner)
            .get();
    }

    public writeOffer(passcode: string, joiner: string, offer: string) {
        return this.db(
            `${this.PARTY_COLLECTION_ID}/${passcode}/${this.PEER_COLLECTION_ID}`,
        )
            .doc(joiner)
            .update({
                offer,
            });
    }

    public async readOffer(passcode: string, joiner: string) {
        const result = await this.peer(passcode, joiner);
        return result.data()!.offer as string;
    }

    public writeAnswer(passcode: string, joiner: string, answer: string) {
        return this.db(
            `${this.PARTY_COLLECTION_ID}/${passcode}/${this.PEER_COLLECTION_ID}`,
        )
            .doc(joiner)
            .update({
                answer,
            });
    }

    public async readAnswer(passcode: string, joiner: string) {
        const result = await this.peer(passcode, joiner);
        return result.data()!.answer as string;
    }

    public listen(passcode: string, joiner?: string) {
        if (this.IS_INITIATOR) {
            return this.db(
                `${this.PARTY_COLLECTION_ID}/${passcode}/${
                    this.PEER_COLLECTION_ID
                }`,
            ).onSnapshot((snapshot) => {
                snapshot.docChanges().forEach(async (change) => {
                    switch (change.type) {
                        case "added":
                            // peer has joined the party, initiator update offer
                            // initiator setLocalDescription
                            await this.writeOffer(
                                passcode,
                                change.doc.id,
                                "offer",
                            );
                            break;
                        case "modified":
                            const answer = change.doc.data().answer;

                            if (answer) {
                                /* tslint:disable-next-line:no-console */
                                console.log(answer);
                            }

                            break;
                        case "removed":
                            break;
                    }
                });
            });
        } else {
            return this.db(
                `${this.PARTY_COLLECTION_ID}/${passcode}/${
                    this.PEER_COLLECTION_ID
                }`,
            )
                .doc(joiner)
                .onSnapshot((snapshot) => {
                    const offer = snapshot.data()!.offer;

                    if (offer) {
                        /* tslint:disable-next-line:no-console */
                        console.log(offer);
                        this.writeAnswer(passcode, snapshot.id, "answer");
                    }
                });
        }
    }
    private db = (collectionPath: string) =>
        this.firestore.collection(collectionPath)
}
