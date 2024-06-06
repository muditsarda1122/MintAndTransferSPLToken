use anchor_lang::prelude::*;
use anchor_spl::token;
use anchor_spl::token::{Transfer, MintTo, Token};


declare_id!("8wTcBHSaRYFXufWVaJu8AYKa7qLdWFpz9RHEbRkeHyiz");

#[program]
pub mod spl_token {
    use super::*;

    pub fn mint_token(ctx: Context<MintToken>,) -> Result<()> {
        // create the MintTo struct 
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();

        // creating the cpi context for our call
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        // executing anchor's mint_to function 
        token::mint_to(cpi_ctx, 10)?;
        Ok(())

    }

    pub fn transfer_token(ctx: Context<TransferToken>,) -> Result<()> {
        // create the Transfer struct
        let transfer_instructions = Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.signer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();

        //creating the cpi context for our call
        let cpi_ctx = CpiContext::new(cpi_program, transfer_instructions);

        // executing anchor's transfer function
        anchor_spl::token::transfer(cpi_ctx, 5)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintToken<'info> {
    /// CHECK: this is not dangerous because we don't read or write from this account
    /// this is the token we want to create more copies of 
    #[account(mut)]
    pub mint: UncheckedAccount<'info>,
    /// program for our CPIContext
    pub token_program: Program<'info, Token>,
    /// CHECK: this is not dangerous because we don't read or write from this account
    /// this is WHO we want to mint the token to 
    /// an ATA
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,
    /// CHECK: this is not dangerous because we don't read or write from this account
    /// this is the authority who authorises us to mint the tokens 
    #[account(mut)]
    pub payer: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct TransferToken<'info> {
    pub token_program: Program<'info, Token>,
    /// CHECK: this is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub from: UncheckedAccount<'info>,
    /// CHECK: this is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub to: AccountInfo<'info>,
    #[account(mut)]
    pub signer: Signer<'info>,
}
