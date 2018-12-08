import Utils from "../src/Utils"
import PartyPeer from "../src/PartyPeer"
import {
    FirebaseFirestore,
} from "@firebase/firestore-types"
import * as Firebase from "firebase"
import firebaseEnv from "../firebase.env.json"
import { spawn } from "child_process"

// silence console error output
console.error = () => {}

function tearDown() {
    return new Promise((resolve, reject) => {
        const cli = spawn("./node_modules/.bin/firebase", [
            "--project",
            firebaseEnv.testing.projectId,
            "firestore:delete",
            "--all-collections",
            "--yes"
        ])
        cli.stdout.on("data", data => {
            console.log(data.toString("utf-8"))
        })
        cli.stdout.on("close", () => {
            console.log("Teardown completed.")
            resolve()
        })
    })
}

describe("PartyPeer test suite.", () => {
    let firestore: FirebaseFirestore
    let pp: PartyPeer

    beforeAll(() => {
        firestore = Firebase.initializeApp(firebaseEnv.testing).firestore()

        pp = new PartyPeer(firestore)
    })

    afterAll(async () => {
        await tearDown()
    })

    describe("Test WebRTC signaling behaviour.", () => {
        const PARTY_NAME = "alice_party"
        const JOINER_1 = "bob"

        it("1. Alice(Initiator) should create party document.", async () => {
            await expect(pp.create(PARTY_NAME)).resolves.not.toThrow()

            const result = await pp.party(PARTY_NAME)

            expect(result.data()!.createTime).toBeDefined()
        })

        it("2. Bob(Joiner) should create peer document in Alice's room.", async () => {
            await expect(pp.join(PARTY_NAME, JOINER_1)).resolves.not.toThrow()

            const result = await pp.peers(PARTY_NAME)

            expect(result.size).toEqual(1)
            expect(result.docs[0].data()!.createTime).toBeDefined()
        })

        it("3. Alice should update SDP offer in Bob's peer document.", async () => {
            await expect(
                pp.writeOffer(
                    PARTY_NAME,
                    JOINER_1,
                    "This is an offer from alice."
                )
            ).resolves.not.toThrow()
        })

        it("4. Bob should read SDP offer from his peer document.", async () => {
            const result = await pp.readOffer(PARTY_NAME, JOINER_1)

            expect(result).toEqual("This is an offer from alice.")
        })

        it("5. Bob should update SDP answer in his peer document.", async () => {
            await expect(
                pp.writeAnswer(
                    PARTY_NAME,
                    JOINER_1,
                    "This is an answer from bob."
                )
            ).resolves.not.toThrow()
        })

        it("6. Alice should read SDP answer from Bob's peer document", async () => {
            const result = await pp.readAnswer(PARTY_NAME, JOINER_1)

            expect(result).toEqual("This is an answer from bob.")
        })
    })

    it("isPartyExists() should return false if a party entry does not exist.", async () => {
        expect(await pp.isPartyExists("noSuchParty1")).toBeFalsy()
        expect(await pp.isPartyExists("noSuchParty2")).toBeFalsy()
    })

    it("party() should throw error if a party entry does not exist.", async () => {
        const result = await pp.party("noSuchRoom1")
        expect(result.exists).toBeFalsy()
    })

    it("join() should create a peer entry in an existing party", async () => {})

    it("join() should throw error if the party does not exist.", async () => {
        await expect(pp.join("noSuchParty1", "bob")).rejects.toThrow()
    })

    it("peers() should return size of zero if there's no peer entry in the party.", async () => {
        await pp.create("emptyParty")
        const result = await pp.peers("emptyParty")

        expect(result.size).toEqual(0)
    })

    it("peers() should throw error if the party does not exist.", async () => {
        await expect(pp.peers("noSuchParty1")).rejects.toThrow()
    })

    it.only("omg", async () => {
        const initiator = new PartyPeer(firestore, true)
        const joiner = new PartyPeer(firestore)
        await initiator.create("123456")
        const unlistenInitiator = initiator.listen("123456")

        await joiner.join("123456", "bob")

        const unlistenJoiner = joiner.listen("123456", "bob")
    })
})

describe("Utils helper methods", () => {
    it("generateRandomSixDigits() should contain six digits", () => {
        const result = Utils.generateRandomSixDigits()

        expect(result.length).toEqual(6)
        expect(/^\d+$/.test(result)).toBeTruthy() // regex to test if all characters are digits
    })
})
