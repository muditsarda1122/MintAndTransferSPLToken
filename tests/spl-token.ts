import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SplToken } from "../target/types/spl_token";
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
} from "@solana/spl-token";
import { assert } from "chai";

describe("spl-token", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SplToken as Program<SplToken>;

  // another key pair that represents the token
  const mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();

  let associatedTokenAccount = undefined;

  it("Mint a token", async () => {
    // this key was created in line 7
    // will be the owner of the token that will be created
    const key = anchor.AnchorProvider.env().wallet.publicKey;
    // this is the minimum rent that will have to be paid to store the ATA on the network. This will later be added to the wallet
    const lamports: number =
      await program.provider.connection.getMinimumBalanceForRentExemption(
        MINT_SIZE
      );

    // get the ATA for a token on a public key (but might not exist yet)
    associatedTokenAccount = await getAssociatedTokenAddress(
      mintKey.publicKey,
      key
    );

    // fires a list of instructions
    const mint_tx = new anchor.web3.Transaction().add(
      // use anchor to create an account with the key that we created
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: key,
        newAccountPubkey: mintKey.publicKey,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
        lamports,
      }),
      // fire a transaction to create our mint account that is controlled by our anchor wallet
      createInitializeMintInstruction(mintKey.publicKey, 0, key, key),
      // create the ATA account that is associated with our mint on our anchor wallet(key)
      createAssociatedTokenAccountInstruction(
        key,
        associatedTokenAccount,
        key,
        mintKey.publicKey
      )
    );

    // send and create the transaction
    const res = await anchor.AnchorProvider.env().sendAndConfirm(mint_tx, [
      mintKey,
    ]);

    console.log(
      await program.provider.connection.getParsedAccountInfo(mintKey.publicKey)
    );

    console.log("Account: ", res);
    console.log("Mint Key: ", mintKey.publicKey.toString());
    console.log("User: ", key.toString());

    // executes our code to mint our token into our specified ATA
    // TO TEST: as long as we provide the right authority and mint token, can we mint to any account?
    const tx = await program.methods
      .mintToken()
      .accounts({
        mint: mintKey.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenAccount: associatedTokenAccount,
        payer: key,
      })
      .rpc();
    console.log("Your transaction signature", tx);

    const minted = (
      await program.provider.connection.getParsedAccountInfo(
        associatedTokenAccount
      )
    ).value.data.parsed.info.tokenAmount.amount;
    assert.equal(minted, 10);
  });

  it("Transfer token", async () => {
    // authority of the account sending
    // owner of the token/ public key that owns the token
    const myWallet = anchor.AnchorProvider.env().wallet.publicKey;
    // ATA that is being used to send
    // associatedTokenAccount = associatedTokenAccount

    // Account that is receiving the token
    const toWallet: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    // get the ATA for a token on a public key (but might not exist yet)
    const toATA = await getAssociatedTokenAddress(
      mintKey.publicKey,
      toWallet.publicKey
    );

    // fires a list of instructions
    const mint_tx = new anchor.web3.Transaction().add(
      // create the ATA account that is associated with our mint on our anchor wallet(key)
      createAssociatedTokenAccountInstruction(
        myWallet,
        toATA,
        toWallet.publicKey,
        mintKey.publicKey
      )
    );

    // sends and create the transaction
    const res = await anchor.AnchorProvider.env().sendAndConfirm(mint_tx, []);

    console.log(res);

    const tx = await program.methods
      .transferToken()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID,
        from: associatedTokenAccount,
        signer: myWallet,
        to: toATA,
      })
      .rpc();
    console.log("Your transaction signature", tx);

    const minted = (
      await program.provider.connection.getParsedAccountInfo(
        associatedTokenAccount
      )
    ).value.data.parsed.info.tokenAmount.amount;
    assert.equal(minted, 5);
  });
});
