import bcrypt from "bcrypt";
import { DataTypes, Model } from "sequelize";

import { sequelize } from "../configs/database";

interface UserAttributes {
    user_id?: number;
    email: string;
    password: string;
    username: string;
}

export class User extends Model<UserAttributes> implements UserAttributes {
    public user_id!: number;
    public email!: string;
    public password!: string;
    public username!: string;

    async isValidPassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }
}

User.init({
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
        validate: {
            isAlphanumeric: true,
        }
    }
}, {
    sequelize,
    modelName: 'User',
    timestamps: true,
});
