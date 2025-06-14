import { Request, Response } from "express";

export const logout = (req: Request, res: Response): void => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false , //have to change it to tru before production
        sameSite: "strict",
    });


    res.redirect("/");
};
