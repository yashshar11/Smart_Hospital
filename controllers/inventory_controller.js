const Inventory = require('../models/inventory');
const SellInfo = require('../models/sell');
const fs = require('fs');
const bcrypt = require('bcrypt');
const mailer = require('../mailers/mailer');

const path = require('path');
const createSellInfoPDF = require('../config/creating_pdf');

module.exports.addInventory = async function (req, res) {
    try {
        const medicine = await Inventory.findOne({ medicine_id: req.body.medicine_id });
        if (!medicine) {
            await Inventory.create(req.body);
            req.flash('success', 'Medicine Added to inventory!!');
            return res.redirect("/admin/add-inventory");
        } else {
            req.flash('error', 'Medicine already exists');
            throw new Error("Medicine already exists");
        }
    } catch (err) {
        console.log("Error in Adding medicine to inventory", err);
        req.flash('error', `Error in adding medicine into inventory!`);
        return res.redirect("back");
    }
}

module.exports.destroyinventory = async function (req, res) {
    try {
        const inventory = await Inventory.findById(req.params.id);
        if (inventory) {
            inventory.deleteOne();
            req.flash('success', 'Deleted Successfully!!');
            res.redirect('back');
        }
        else {
            req.flash('error', 'No data found to delete!!')
            return res.redirect('back');
        }
    } catch (err) {
        console.log("Error in removing medicine from inventory", err);
        req.flash('error', err)
        return res.redirect('back');
    }
}
module.exports.removeinventory = async function (req, res) {
    try {
        const medicineIds = req.body.medicine_id;
        const stocks = req.body.stock;

        for (let i = 0; i < medicineIds.length; i++) {
            const data = await Inventory.findOne({ medicine_id: medicineIds[i] });
            if (data) {
                if (data.stock >= stocks[i]) {
                    data.stock -= stocks[i];
                    let money = data.price * stocks[i];
                    if (data.discount > 0) {
                        money = money - ((money * data.discount) / 100);
                    }
                    if (data.gst > 0) {
                        money = money + ((money * data.gst) / 100);
                    }
                    // Create a SellInfo record for each item
                    await SellInfo.create({
                        medicine_id: medicineIds[i],
                        name: data.name,
                        unit: stocks[i],
                        cost: data.price,
                        amount: money,
                        discount: data.discount,
                        gst: data.gst,
                        user: req.user._id
                    });

                    if (data.stock === 0) {
                        await Inventory.findByIdAndRemove(data.id);
                    } else {
                        await data.save();
                    }
                } else {
                    req.flash('error', 'Not enough stock available for item ' + i);
                }
            } else {
                req.flash('error', 'Medicine with ID ' + medicineIds[i] + ' does not exist');
            }
        }
        let info = { userid: req.user._id, medicineIds: medicineIds, stocks: stocks, name: req.body.buyer_name, mobile: req.body.mobile_number, staff: req.user.name, email: req.body.buyer_email, address: req.body.address, doctor: req.body.doctor_name, payment: req.body.payment_mode };
        // Generate the PDF and get the file path

        const pdfFilePath = await createSellInfoPDF(info);
        let data = {
            name: req.body.buyer_name,
            email: req.body.buyer_email,
            user: req.user._id
        };
        if (data.email) {
            mailer.sendReport(data);
        }
        if (req.xhr) {
            return res.status(200).json({
                data: {
                    pdfFilePath: pdfFilePath
                },
                message: "Updated!"
            });
        }
        // Respond with the PDF file path
        req.flash('success', 'Stock updated successfully');

        return res.redirect('back');
    } catch (err) {
        req.flash('error', `Error in removing inventory!`);
        console.error("Error in removing inventory:", err.message);
        return res.redirect('back');
    }
}



module.exports.downloadPDF = function (req, res) {
    const { userid } = req.params;


    // Construct the full path to the PDF file (or wherever your PDF is generated)
    const parentDirectory = path.join(__dirname, '..'); // Navigate to the parent directory
    const filePath = path.join(parentDirectory, `sell_info_${userid}.pdf`);

    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // If the file doesn't exist, send an error response
            res.status(404).send('Sorry!!!!!  Bill Not Generated Yet, Try Sell some medicine.');
        } else {
            // Set the response headers for PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=sell_info_${userid}.pdf`);

            // Stream the file to the response
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        }
    });
};
