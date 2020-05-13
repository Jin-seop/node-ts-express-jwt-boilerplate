import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { Strategy, ExtractJwt, JwtFromRequestFunction } from 'passport-jwt';
import config from "../../config/config";
import { User } from "../../entity/User";
import * as jwt from "jsonwebtoken";
import * as jwtDecode from 'jwt-decode';

export default class AdminUserController {

    //USERS
    static editUser = async (req: Request, res: Response) => {
        //Get the ID from the url
        const id = req.params.id;

        //Get values from the body
        const { displayName, email, role, firstName, lastName } = req.body;

        //Try to find user on database
        const userRepository = getRepository(User);
        let user;
        try {
            user = await userRepository.findOneOrFail(id);
        } catch (error) {
            //If not found, send a 404 response
            res.status(404).send("User not found");
            return;
        }

        //Validate the new values on model
        user.email = email;
        user.displayname = displayName;
        user.role = role;
        user.firstName = firstName;
        user.lastName = lastName;
        const errors = await validate(user);
        if (errors.length > 0) {
            res.status(400).send(errors);
            return;
        }

        //Try to safe, if fails, that means email already in use
        try {
            await userRepository.save(user);
        } catch (e) {
            res.status(409).send("email already in use");
            return;
        }
        //After all send a 204 (no content, but accepted) response
        res.status(204).send();
    };

    //Get users
    static getAllUsers = async (req: Request, res: Response) => {
        //Get users from database
        const userRepository = getRepository(User);
        const users = await userRepository.find({
            select: ["id", "provider", "providerId", "email", "displayName", "role", "firstName", "lastName",] //We dont want to send the passwords on response
        });

        //Send the users object
        res.send(users);
    };

    static deleteUser = async (req: Request, res: Response) => {
        //Get the ID from the url
        const id = req.params.id;

        const userRepository = getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail(id);
        } catch (error) {
            res.status(404).send("User not found");
            return;
        }
        userRepository.delete(id);

        //After all send a 204 (no content, but accepted) response
        res.status(204).send();
    };

}