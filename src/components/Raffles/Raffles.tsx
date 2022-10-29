import { useEffect, useState } from "react";
import "../../css/App.css";
import LogoWhite from "../../assets/Logowhite.png";
import User from "../../assets/user.png";

const RaffleContent = (props: any) => {

    const [logoLoading, setLogoLoading] = useState(true);

    useEffect(() => {
        setTimeout(function() {
            setLogoLoading(false);
        }, 3000)
    }, []);

    return (
        <div className={logoLoading ? "main-bg-raffles black-bg" : "main-bg-raffles"}>
            {logoLoading && (
                <div className="logo-loader-parent">
                <img alt="Alpha-logo" src={LogoWhite} className="pulse-animation" />
                </div>
            )}
            {!logoLoading && 
            <div className="raffle-parent">
                <div className="raffle-header">
                    <div className="raffle-user-parent">
                        <img src={User} className="raffle-user-img" alt="" />
                    </div>
                    <div className="create-raffle-parent">
                        <button className="create-raffle-btn">Create Raffle</button>
                    </div>
                </div>
            </div>
            }
        </div>
    );
};

export default RaffleContent;
